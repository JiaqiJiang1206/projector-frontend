import React, { useEffect, useRef } from 'react';
import cytoscape, {
  Core,
  ElementDefinition,
  Stylesheet,
  NodeSingular,
} from 'cytoscape';
import fcose from 'cytoscape-fcose'; // fCoSE图布局算法

cytoscape.use(fcose);

interface CanvasBoardProps {
  graphData: {
    keyinfo: {
      id: number;
      keyword: string;
      image?: string;
      description?: string;
    }[];
    connections: {
      from: number;
      to: number;
      relationship: string;
    }[];
  } | null;
  canvasSize: {
    width: number;
    height: number;
  };
}

interface FloatParams {
  originX: number;
  originY: number;
  angleX: number;
  angleY: number;
  speedX: number;
  speedY: number;
  amplitudeX: number;
  amplitudeY: number;
}

const CanvasBoard: React.FC<CanvasBoardProps> = ({ graphData, canvasSize }) => {
  const cyRef = useRef<Core | null>(null); // Cytoscape 实例的引用
  const containerRef = useRef<HTMLDivElement | null>(null); // 容器 DOM 引用

  // 用来存放所有定时器或动画帧的 ID
  const animationIntervals = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!graphData || !containerRef.current) return;
    // 如果已有实例，先销毁
    if (cyRef.current) {
      clearAllIntervals();
      cyRef.current.destroy();
      cyRef.current = null;
    }

    cyRef.current = cytoscape({
      container: containerRef.current!,
      elements: transformDataToElements(graphData),
      style: cytoscapeStyles,
      layout: fcoseLayout,
    });

    cyRef.current.userZoomingEnabled(true); // 启用缩放
    cyRef.current.userPanningEnabled(true); // 启用平移

    // 把所有节点、所有边都设为 .hidden
    cyRef.current.nodes().addClass('hidden');
    cyRef.current.edges().addClass('hidden');

    // 布局结束后，逐个显现节点
    cyRef.current.on('layoutstop', () => {
      revealNodesOneByOne(() => {
        // 当节点全部显示完，再显示所有边
        showAllEdges();
        // 最后再启动随机飘动
        startRandomFloating();
      });
    });

    // 组件卸载时，清理
    return () => {
      clearAllIntervals();
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphData]);

  /**
   * 依次显现节点
   */
  const revealNodesOneByOne = (onComplete?: () => void) => {
    const cy = cyRef.current;
    if (!cy) return;

    const allNodes = cy.nodes();
    // 如果没有节点
    if (allNodes.length === 0) {
      onComplete?.();
      return;
    }

    let index = 0;

    // 第一个节点先立刻显现
    const firstNode = allNodes[index];
    firstNode.removeClass('hidden');

    // 如果是 keyword-node，则把它对应的子节点也显现
    if (firstNode.hasClass('keyword-node')) {
      const childNode = cy.$(`#${firstNode.id()}-child`);
      childNode.removeClass('hidden');
    }

    index++;

    // 如果只有一个节点，则直接结束
    if (index >= allNodes.length) {
      onComplete?.();
      return;
    }

    // 每隔 800ms 显示一个节点
    const revealInterval = setInterval(() => {
      if (index >= allNodes.length) {
        clearInterval(revealInterval);
        onComplete?.();
        return;
      }

      const node = allNodes[index];
      node.removeClass('hidden');

      if (node.hasClass('keyword-node')) {
        const childNode = cy.$(`#${node.id()}-child`);
        childNode.removeClass('hidden');
      }

      index++;
    }, 800);

    // 存下定时器 ID，组件卸载时清理
    animationIntervals.current.push(revealInterval);
  };

  /**
   * 一次性让所有边出现
   */
  const showAllEdges = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.edges().removeClass('hidden');
  };

  /**
   * 随机飘动
   */
  const startRandomFloating = () => {
    const cy = cyRef.current;
    if (!cy) return;

    // 给每个节点设置随机运动参数
    cy.nodes().forEach((node: NodeSingular) => {
      const initPos = { ...node.position() };
      // 将随机飘动数据存到自定义属性 _floatParams 中
      (node as any)._floatParams = {
        originX: initPos.x,
        originY: initPos.y,
        angleX: Math.random() * 2 * Math.PI,
        angleY: Math.random() * 2 * Math.PI,
        speedX: 0.03 + Math.random() * 0.02,
        speedY: 0.03 + Math.random() * 0.02,
        amplitudeX: 5 + Math.random() * 10,
        amplitudeY: 5 + Math.random() * 10,
      } as FloatParams;
    });

    // setInterval 周期性更新
    const intervalId = setInterval(() => {
      cy.nodes().forEach((node: NodeSingular) => {
        const p: FloatParams | undefined = (node as any)._floatParams;
        if (!p) return;
        p.angleX += p.speedX;
        p.angleY += p.speedY;
        const newX = p.originX + p.amplitudeX * Math.sin(p.angleX);
        const newY = p.originY + p.amplitudeY * Math.cos(p.angleY);
        node.position({ x: newX, y: newY });
      });
    }, 60);

    animationIntervals.current.push(intervalId);
  };

  /**
   * 清理所有定时器
   */
  const clearAllIntervals = () => {
    animationIntervals.current.forEach((id) => {
      clearInterval(id);
    });
    animationIntervals.current = [];
  };

  return (
    <div
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        position: 'relative',
      }}
    >
      {graphData ? (
        <div
          id="cy"
          ref={containerRef}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
          }}
        />
      ) : (
        <div className="absolute" style={welcomeTextStyle}>
          W E L C O M E
        </div>
      )}
    </div>
  );
};

const welcomeTextStyle: React.CSSProperties = {
  // position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '36px',
  color: '#ffffff',
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
};

const fcoseLayout = {
  name: 'grid', //或用 fcose？
  quality: 'proof',
  randomize: true,
  animate: true,
  animationDuration: 500,
  fit: true,
  padding: 30,
  nodeDimensionsIncludeLabels: true,
  uniformNodeDimensions: false,
  packComponents: true,
  step: 'all',
  nodeSeparation: 600, // 增加节点分隔距离
  idealEdgeLength: 200, // 增加边的理想长度
  nodeRepulsion: 8000, // 增加节点排斥力
  // idealEdgeLength: 150, // 增加边的理想长度，默认50
  edgeElasticity: 0.45, // 调整边的弹性
  nestingFactor: 0.1, // 控制父子节点的间距
  gravity: 0.05, // 减少全局引力，增加分散性
  // nodeSeparation: 400, // 强制增加节点分隔距离
  // orientation: 'vertical', // 设置垂直排列
};

const cytoscapeStyles: Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': 'transparent', // 明确设置为透明
      'background-opacity': 0, // 移除背景
      color: '#fff',
      'font-size': '30px',
      'text-wrap': 'wrap',
    },
  },
  {
    selector: 'node.keyword-node',
    style: {
      label: 'data(keyword)',
      'text-wrap': 'wrap',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-weight': 'bold',
      grabbable: true,
    },
  },
  {
    selector: 'node.detail-node',
    style: {
      label: 'data(details)',
      'text-wrap': 'wrap',
      'text-valign': 'bottom',
      'text-halign': 'center',
      // 'text-margin-y': '10px',
      width: 'data(size)',
      height: 'data(size)',
      'background-image': 'data(image)',
      'background-fit': 'contain',
      'background-clip': 'none',
      grabbable: true,
    },
  },
  {
    selector: 'edge',
    style: {
      label: 'data(label)',
      'text-rotation': 'autorotate',
      'font-weight': 'bold',
      'font-size': '25px',
      'text-margin-x': '-10px',
      'text-margin-y': '-10px',
      width: 2,
      // 'line-color': '#fff',
      'target-arrow-color': '#fff',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      color: '#fff',
      'source-endpoint': 'outside-to-node',
      'target-endpoint': 'outside-to-node',
      'arrow-scale': 1.2,
    },
  },
  // 隐藏节点和边的类
  {
    selector: '.hidden',
    style: {
      visibility: 'hidden',
      opacity: 0,
    },
  },
];

function transformDataToElements(
  graphData: CanvasBoardProps['graphData']
): ElementDefinition[] {
  if (!graphData) return [];
  const { keyinfo: nodes, connections: edges } = graphData;
  const elements: ElementDefinition[] = [];
  const degreeMap: Record<string, number> = {};

  nodes.forEach((node) => {
    degreeMap[node.id] = 0;
  });

  edges.forEach((edge) => {
    degreeMap[edge.from] = (degreeMap[edge.from] || 0) + 1;
    degreeMap[edge.to] = (degreeMap[edge.to] || 0) + 1;
    elements.push({
      data: {
        id: `${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        label: edge.relationship,
      },
    });
  });

  const degrees = Object.values(degreeMap);
  const maxDegree = Math.max(...degrees);
  const minDegree = Math.min(...degrees);

  nodes.forEach((node) => {
    const degree = degreeMap[node.id];
    const hasImage = node.image && node.image.trim() !== '';
    const size = hasImage
      ? 250 + ((degree - minDegree) / (maxDegree - minDegree || 1)) * 250
      : 1;

    const processedDescription = (node.description ?? '').replace(
      /([\u4e00-\u9fa5]{12})/g,
      '$1\n'
    ); // 每12个汉字换行

    elements.push({
      data: {
        id: node.id,
        keyword: node.keyword,
      },
      classes: 'keyword-node',
    });

    elements.push({
      data: {
        id: `${node.id}-child`,
        parent: node.id,
        image: `/img/materials/${node.image || ''}`,
        degree: degree,
        size: size,
        details: processedDescription,
      },
      classes: 'detail-node',
    });
  });

  return elements;
}

export default CanvasBoard;
