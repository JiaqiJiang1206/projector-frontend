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
    "Absorption": ["U1", "U2", "U3"],
    "Perceived Usability": ["U4", "U5", "U6"],
    "Aesthetic Appeal": ["U7", "U8", "U9"],
    "Rewarding": ["U10", "U11", "U12"]
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
    kind="box", height=5, aspect=2, palette="Set2"
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
    value_vars=["C1", "C2", "C3"],
    var_name="Metric",
    value_name="Value"
  )
  # 重命名指标
  metric_names = {
    "C1": "Intrinsic Load",
    "C2": "Extraneous Load",
    "C3": "Germane Load"
  }
  melted["Metric"] = melted["Metric"].map(metric_names)
  melted.to_csv("melted_c123_data.csv", index=False)
  g = sns.catplot(
    data=melted, x="Metric", y="Value", hue=condition_column,
    kind="box", height=5, aspect=1.2, palette="Set2"
  )
  g.set_axis_labels("Metric", "Value")
  g.fig.suptitle("Intrinsic Load, Extraneous Load, Germane Load by Condition (Seaborn catplot)", y=1.03)
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
  
  # 重命名条件列
  condition_names = {
    1: "Baseline",
    2: "Cue Only",
    3: "Material"
  }
  data[condition_column] = data[condition_column].map(condition_names)
  # 设置条件列的顺序
  data[condition_column] = pd.Categorical(
    data[condition_column], categories=["Baseline", "Cue Only", "Material"], ordered=True
  )
  g = sns.catplot(
    data=data, x=condition_column, y="sus_score",
    kind="box", height=5, aspect=1.5, palette="Set2"
  )
  g.set_axis_labels("Condition", "SUS Score")
  g.fig.suptitle("SUS Scores by Condition", y=1.03)
  plt.tight_layout()
  # 保存图片并添加时间戳
  timestamp = time.strftime("%Y%m%d-%H%M%S")
  plt.savefig(f"sus_scores_by_condition_{timestamp}.png")
  plt.show()

def analyze_a1_a6_sns(file_path, condition_column):
    data = pd.read_csv(file_path)
    data["A12"] = (data["A1"] + data["A2"]) / 2
    data["A34"] = (data["A3"] + data["A4"]) / 2
    data["A56"] = (data["A5"] + data["A6"]) / 2
    
    melted_a = data.melt(
        id_vars=[condition_column],
        value_vars=["A12", "A34", "A56"],
        var_name="Metric",
        value_name="Score"
    )
    g = sns.catplot(
        data=melted_a, x="Metric", y="Score", 
        hue=condition_column, kind="box", 
        height=5, aspect=1.5, palette="Set2"
    )
    g.set_axis_labels("Metric", "Score")
    g.fig.suptitle("A1-A2, A3-A4, A5-A6 by Condition", y=1.03)
    plt.tight_layout()
    # 保存图片并添加时间戳
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    plt.savefig(f"a1_a6_by_condition_{timestamp}.png")
    plt.show()
  
# process_and_plot_ues_sns("scale-result33.csv", "Participant", "condition")
# analyze_c123_sns("scale-result33.csv", "condition")
# analyze_sus_sns("scale-result33.csv", "condition")
# analyze_a1_a6_sns("scale-result33.csv", "condition")
# process_and_plot_ues_sns("scale-result_delete1314.csv", "Participant", "condition")
# analyze_c123_sns("scale-result_delete1314.csv", "condition")
# analyze_sus_sns("scale-result_delete1314.csv", "condition")
# analyze_a1_a6_sns("scale-result_delete1314.csv", "condition")

# process_and_plot_ues_sns("scale-result33_delete0910.csv", "Participant", "condition")
# analyze_c123_sns("scale-result33_delete0910.csv", "condition")
# analyze_sus_sns("scale-result33_delete0910.csv", "condition")
analyze_a1_a6_sns("scale-result33_delete0910.csv", "condition")