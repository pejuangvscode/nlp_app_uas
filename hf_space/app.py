import os
import json
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModel, AutoTokenizer

app = FastAPI(title="RAPHA MEDICAL AI - HuggingFace Inference API")

# ─────────────────────────────────────────────
#  Custom Model Architecture
# ─────────────────────────────────────────────
class MultiHeadDiseaseClassifier(nn.Module):
    def __init__(self, model_name, num_clusters, num_diseases, dropout=0.4):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(dropout)
        self.cluster_head = nn.Linear(self.bert.config.hidden_size, num_clusters)
        self.disease_head = nn.Linear(self.bert.config.hidden_size, num_diseases)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.last_hidden_state[:, 0, :]
        pooled_output = self.dropout(pooled_output)
        cluster_logits = self.cluster_head(pooled_output)
        disease_logits = self.disease_head(pooled_output)
        return cluster_logits, disease_logits

# ─────────────────────────────────────────────
#  Load Model at Startup
# ─────────────────────────────────────────────
model = None
tokenizer = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

@app.on_event("startup")
def load_model():
    global model, tokenizer
    model_dir = "best_model"
    
    config_path = os.path.join(model_dir, "multihead_config.json")
    weights_path = os.path.join(model_dir, "pytorch_model.bin")
    
    if not os.path.exists(config_path) or not os.path.exists(weights_path):
        print(f"ERROR: Model files not found in {model_dir}/")
        return
        
    with open(config_path, "r") as f:
        config = json.load(f)
        
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = MultiHeadDiseaseClassifier(
        model_name=config["model_name"],
        num_clusters=config["num_clusters"],
        num_diseases=config["num_diseases"],
        dropout=config.get("dropout", 0.4)
    )
    
    state_dict = torch.load(weights_path, map_location="cpu", weights_only=False)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    print(f"Model successfully loaded on {device}")

# ─────────────────────────────────────────────
#  API Endpoints
# ─────────────────────────────────────────────
class InferenceRequest(BaseModel):
    inputs: str
    parameters: dict = None

@app.get("/")
def read_root():
    return {"status": "ok", "model": "RAPHA Medical Custom Model is Running"}

@app.post("/")
def predict(req: InferenceRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    inputs = tokenizer(
        req.inputs,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=True
    )
    
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)
    
    with torch.no_grad():
        cluster_logits, disease_logits = model(input_ids, attention_mask)
        
    probs = torch.softmax(disease_logits, dim=-1)
    top_probs, top_indices = torch.topk(probs, 5, dim=-1)
    
    # Return in standard HuggingFace Inference API format (list of list of dicts)
    result = []
    for i in range(5):
        result.append({
            "label": f"LABEL_{top_indices[0][i].item()}",
            "score": float(top_probs[0][i].item())
        })
        
    return [result]
