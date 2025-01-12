import { axiosInstance } from './axiosConfig';
// Store slices
import {
  ExperimentConditions,
  PosterTypes,
} from '../store/slices/conditionSlice';
import axios from 'axios';

export const sayHelloService = (experimentCondition, posterType) => {
  const helloRequestNotMaterial = `
      请向用户介绍你自己，并用大约100字的陈述句告诉用户与你的交互流:
        1. 告诉用户你是谁。
        2. 邀请用户就海报跟你聊天。
        3. 邀请用户与你就海报的内容进行讨论,让用户向你提问。
        注意："highlight"部分置空，"emotion"部分选择积极情绪。
  
        # 约束条件
        仅回复所要求的 JSON 输出，遵守上述要求，不包含任何无关信息。
        请仅以纯文本形式回复。确保答案不包含任何代码格式或代码块，如 \`\`\`json.`;
  const helloRequestHasMaterial = `
      请向用户介绍你自己，并用大约100字的陈述句告诉用户与你的交互流:
        1. 告诉用户你是谁。
        2. 邀请用户就海报跟你聊天。
        3. 告诉用户在之后的交流中你会回答用户的问题并进行一些反问,在右边的扩展面板上为用户提供更多信息。
        4. 邀请用户与你就海报的内容进行讨论,让用户向你提问。
        注意："highlight"部分置空，"emotion"部分选择积极情绪。
  
        # 约束条件
        仅回复所要求的 JSON 输出，遵守上述要求，不包含任何无关信息。
        请仅以纯文本形式回复。确保答案不包含任何代码格式或代码块，如 \`\`\`json.`;

  const helloRequest =
    experimentCondition === ExperimentConditions.CueAndMaterial
      ? helloRequestHasMaterial
      : helloRequestNotMaterial;

  const poster =
    posterType === PosterTypes.PosterOne
      ? '1'
      : posterType === PosterTypes.PosterTwo
      ? '2'
      : '3';

  return axiosInstance.post('/sayhello', {
    content: helloRequest,
    poster: poster,
  });
};

export const getPickerMessage = (
  messageText,
  experimentCondition,
  posterType
) => {
  const poster =
    posterType === PosterTypes.PosterOne
      ? '1'
      : posterType === PosterTypes.PosterTwo
      ? '2'
      : '3';

  // 发送消息给 /picker 接口
  const pickerMessage = `${messageText}\n
        - 仅以所要求的 JSON 输出进行回复，不包含任何无关信息。\n
        - 重要！！！请仅以纯文本形式回复，确保答案中不包含任何代码格式或块，例如 \`\`\`json。 \n
        - 所说的内容要具体，如果有例子尽量提供相应的例子。 \n
        - 你的输出需要严格按照json格式输出，并考虑到可能的转义字符问题，不要在字符串中再包含英文引号，以防json解析失败。 \n
        - Dialogue 的值是一个只包含纯文本和中文标点符号的字符串(最外层使用英文引号包裹)，不要包含任何可能导致 json 解析失败的特殊字符。\n
        - 严格按照以下数据结构输出：\n
        {
          "highlighted": [
            {
              "id":int, 
              "text": str,
              "type": str
            },
            {
              "id":int,
              "text": str,
              "type": str,
              "keywords": [str]
            },
            {
              "id": int,
              "text": str,
              "type": str
            }
          ],
          "Dialogue": str,
          "Emotion": str
        }
        ${
          experimentCondition === ExperimentConditions.CueAndMaterial
            ? ''
            : '- 请不要说海报右侧有内容。'
        }
        `;
  return axiosInstance.post('/picker', {
    content: pickerMessage,
    poster: poster,
  });
};

export const getRelationshipMessage = (message) => {
  const messageText = `${message} + \n
      - 仅以所要求的 JSON 输出进行回复，不包含任何无关信息。\n
      - 请仅以纯文本形式回复，确保答案中不包含任何代码格式或块，例如 \`\`\`json。
      - 每个节点生成的字数不超过二十个字。
      - 如果在image.txt 和 content.txt 中找不到任何相关信息，请不要编造描述，直接留空。不要生成不符合事实的信息。
      - 确保每张图片只在一个节点中出现，不要在多个节点中出现同一张图片。`;

  // 返回一个 Promise
  return axios.post('http://localhost:3001/ask', {
    content: messageText, // Express 接口要求的字段
  });
};
