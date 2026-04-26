import torch
import json
from transformers import AutoModel

class MultiHeadDiseaseClassifier(torch.nn.Module):
    def __init__(self, model_name, num_clusters, num_diseases, dropout=0.0):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        self.dropout = torch.nn.Dropout(dropout)
        self.cluster_head = torch.nn.Linear(self.bert.config.hidden_size, num_clusters)
        self.disease_head = torch.nn.Linear(self.bert.config.hidden_size, num_diseases)

    def forward_pooler(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        return self.disease_head(pooled_output)

    def forward_cls(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.last_hidden_state[:, 0, :]
        return self.disease_head(pooled_output)

with open("best_model/multihead_config.json", "r") as f:
    config = json.load(f)

model = MultiHeadDiseaseClassifier(config["model_name"], config["num_clusters"], config["num_diseases"], 0.0)
state_dict = torch.load("backend/best_model/pytorch_model.bin", map_location="cpu", weights_only=False)
model.load_state_dict(state_dict)
model.eval()

# Fake input
input_ids = torch.randint(0, 30000, (1, 128))
attention_mask = torch.ones(1, 128)

with torch.no_grad():
    logits_pooler = model.forward_pooler(input_ids, attention_mask)
    logits_cls = model.forward_cls(input_ids, attention_mask)

print("Pooler variance:", torch.var(logits_pooler).item())
print("CLS variance:", torch.var(logits_cls).item())
print("Pooler max conf:", torch.max(torch.softmax(logits_pooler, dim=-1)).item())
print("CLS max conf:", torch.max(torch.softmax(logits_cls, dim=-1)).item())
