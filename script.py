from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from openai import OpenAI
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
import re
import time
import sys
import datetime

# 将上一层文件夹添加到 Python 的搜索路径中
sys.path.append(os.path.abspath('..'))

def log_message(role: str, content: str):
    data = []
    if os.path.exists("chatlog.json"):
        with open("chatlog.json", "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except:
                data = []
    data.append({
        "role": role,
        "timestamp": datetime.datetime.now().isoformat(),
        "content": content
    })
    with open("chatlog.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def preprocess_json(json_string):
    """
    预处理 JSON 字符串，修复常见格式问题，包括去除 ```json 和 ``` 标记。
    """
    # 移除 ```json 和 ``` 的标记
    if json_string.startswith("```json"):
        json_string = json_string[7:].strip()  # 移除开头的 ```json
    if json_string.endswith("```"):
        json_string = json_string[:-3].strip()  # 移除结尾的 ```
    
    try:
        # 尝试直接解析 JSON 字符串
        return json.loads(json_string)
    except json.JSONDecodeError:
        # 修复 JSON 中的无引号键和值
        json_string = re.sub(r'(?<!")(\b\w+\b)(?=\s*:)', r'"\1"', json_string)  # 为键补充引号
        json_string = re.sub(r':\s*(\b\w+\b)(?=\s*[,\}])', r': "\1"', json_string)  # 为值补充引号
        try:
            return json.loads(json_string)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to preprocess JSON: {str(e)}")

def GeneratorHandler(input_json):
    """
    解析并提取 JSON 数据中的特定结构。
    """
    try:
        # 预处理 JSON 字符串
        input_json = preprocess_json(input_json)

        # 提取 return1 和 return2
        return1 = {
            "keyinfo": input_json.get("keyinfo", []),
            "connections": input_json.get("connections", [])
        }
        return2 = input_json.get("message", "")

        return return1, return2
    except ValueError as e:
        # 捕获预处理错误或解析错误
        return None, f"Invalid JSON string: {str(e)}"

app = FastAPI()

# 加载 .env 文件中的环境变量
load_dotenv()

client = OpenAI()
# 设置允许的源
origins = [
  "http://localhost",
  "http://localhost:3000",
  # 你可以在这里添加更多的允许源
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# 从playground中调用assistant
assistant = client.beta.assistants.retrieve("asst_YpyxHD5eDY3bmbUqJhDSV0Ij")

# 定义请求体模型
class AskRequest(BaseModel):
    content: str
    
@app.post('/ask')
async def ask(request: AskRequest):
  print(request)
  user_message = request.content  # 获取消息内容

  thread = client.beta.threads.create()

  message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content=user_message
  )

  run = client.beta.threads.runs.create_and_poll(
    thread_id=thread.id,
    assistant_id=assistant.id,
    instructions=""
  )

  if run.status == 'completed':
    messages = client.beta.threads.messages.list(
      thread_id=thread.id
    )
    for message in messages.data:
      if message.role == 'assistant':
        assistant_reply = message.content[0].text.value  # 获取文本内容
        break
    print(assistant_reply)
    generatorDraw, generatorChat = GeneratorHandler(assistant_reply)
    result = {
      "generator_draw": generatorDraw,
      "generator_chat": generatorChat
    }
    log_message("relationshipResponse", f"{result}")
    return result
  else:
    return JSONResponse(content={'status': run.status}, status_code=500)

if __name__ == '__main__':
  import uvicorn
  uvicorn.run(app, host='0.0.0.0', port=3001)