import pandas as pd
import numpy as np
from scipy.stats import f_oneway
import seaborn as sns
import time
import matplotlib.pyplot as plt

def process_and_plot_ues_sns(file_path, participant_column, condition_column):
  data = pd.read_csv(file_path)
  
  # 定义反向编码的题目
  reverse_items = ["U4", "U5", "U6"]
  
  # 反向编码
  for item in reverse_items:
    data[item] = 6 - data[item]
  
  # 定义子量表和对应的题目
  categories = {
    "A-S": ["U1", "U2", "U3"],
    "PU-S": ["U4", "U5", "U6"],
    "AE-S": ["U7", "U8", "U9"],
    "RW-S": ["U10", "U11", "U12"]
  }
  # 保存数据
  data.to_csv("processed_ues_data.csv", index=False)
  # 计算子量表得分
  for group, items in categories.items():
    data[f"{group}_score"] = data[items].mean(axis=1)
  
  # 计算总分
  all_items = sum(categories.values(), [])
  data["overall_engagement"] = data[all_items].mean(axis=1)
  
  # 绘制箱线图
  melted_data = data.melt(
    id_vars=[participant_column, condition_column],
    value_vars=[f"{group}_score" for group in categories.keys()] + ["overall_engagement"],
    var_name="Metric",
    value_name="Score"
  )
  g = sns.catplot(
    data=melted_data, x="Metric", y="Score", hue=condition_column,
    kind="box", height=5, aspect=2
  )
  g.set_xticklabels(rotation=45)
  g.set_axis_labels("Metric", "Score")
  g.fig.suptitle("UES Scores by Condition (Seaborn catplot)", y=1.03)
  g.legend.set_title("Condition")
  plt.tight_layout()
  
  # 保存图片并添加时间戳
  timestamp = time.strftime("%Y%m%d-%H%M%S")
  plt.savefig(f"ues_scores_by_condition_{timestamp}.png")
  plt.show()

def analyze_c123_sns(file_path, condition_column):
  data = pd.read_csv(file_path)
  # ...existing code (准备 C1, C2, C3 数据)...
  melted = data.melt(
    id_vars=[condition_column],
    value_vars=["C1","C2","C3"],
    var_name="Metric",
    value_name="Value"
  )
  melted.to_csv("melted_c123_data.csv", index=False)
  g = sns.catplot(
    data=melted, x="Metric", y="Value", hue=condition_column,
    kind="box", height=5, aspect=1.2
  )
  g.set_axis_labels("Metric", "Value")
  g.fig.suptitle("C1, C2, C3 by Condition (Seaborn catplot)", y=1.03)
  g.legend.set_title("Condition")
  plt.tight_layout()
  # 保存图片并添加时间戳
  timestamp = time.strftime("%Y%m%d-%H%M%S")
  plt.savefig(f"c123_by_condition_{timestamp}.png")
  plt.show()

def analyze_sus_sns(file_path, condition_column):
  data = pd.read_csv(file_path)
  data["sus_score"] = 2.5 * (
    20
    + (data["S1"] + data["S3"] + data["S5"] + data["S7"] + data["S9"])
    - (data["S2"] + data["S4"] + data["S6"] + data["S8"] + data["S10"])
  )
  g = sns.catplot(
    data=data, x=condition_column, y="sus_score",
    kind="box", height=5, aspect=1.5
  )
  g.set_axis_labels("Condition", "SUS Score")
  g.fig.suptitle("SUS Scores by Condition", y=1.03)
  plt.tight_layout()
  # 保存图片并添加时间戳
  timestamp = time.strftime("%Y%m%d-%H%M%S")
  plt.savefig(f"sus_scores_by_condition_{timestamp}.png")
  plt.show()
  
process_and_plot_ues_sns("scale-result11.csv", "Participant", "condition")
# analyze_c123_sns("scale-result11.csv", "condition")
# analyze_sus_sns("scale-result11.csv", "condition")