import React, { useEffect, useRef } from 'react';
import cytoscape, { Core, ElementDefinition, Stylesheet } from 'cytoscape';
import fcose from 'cytoscape-fcose'; // fCoSE图布局算法

cytoscape.use(fcose);

interface CanvasBoardProps {
  graphData: {
    keyinfo: {
      id: number;
      keyword: string;
      image?: string;
      description?: string;
      otherinfo?: string;
    }[];
    connections: {
      from: number;
      to: number;
      relationship: string;
    }[];
  } | null;
}

const CanvasBoard: React.FC<CanvasBoardProps> = ({ graphData }) => {
  const cyRef = useRef<Core | null>(null); // Cytoscape 实例的引用
  const containerRef = useRef<HTMLDivElement | null>(null); // 容器 DOM 引用

  useEffect(() => {
    if (!graphData || !containerRef.current) return;
    if (cyRef.current) cyRef.current.destroy(); // 销毁旧实例

    cyRef.current = cytoscape({
      container: containerRef.current!,
      elements: transformDataToElements(graphData),
      style: cytoscapeStyles,
      layout: fcoseLayout,
    });

    cyRef.current.userZoomingEnabled(true); // 启用缩放
    cyRef.current.userPanningEnabled(true); // 启用平移

    return () => {
      cyRef.current?.destroy(); // 组件卸载时清理 Cytoscape 实例
    };
  }, [graphData]);

  return (
    <div style={{ width: 800, height: '100%', position: 'relative' }}>
      {graphData ? (
        <div
          id="cy"
          ref={containerRef}
          style={{
            width: 800,
            height: '100%',
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        />
      ) : (
        <div style={welcomeTextStyle}>W E L C O M E</div>
      )}
    </div>
  );
};

const welcomeTextStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '48px',
  color: '#ffffff',
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
};

const fcoseLayout = {
  name: 'grid',
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
  nodeRepulsion: 5000, // 增加节点排斥力，默认4500
  idealEdgeLength: 150, // 增加边的理想长度，默认50
  edgeElasticity: 0.45, // 调整边的弹性
  nestingFactor: 0.1, // 控制父子节点的间距
  gravity: 0.1, // 减少全局引力，增加分散性
  nodeSeparation: 400, // 强制增加节点分隔距离
  // orientation: 'vertical', // 设置垂直排列
};

const cytoscapeStyles: Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': 'transparent', // 明确设置为透明
      'background-opacity': 0, // 移除背景
      color: '#fff',
    },
  },
  {
    selector: 'node.keyword-node',
    style: {
      label: 'data(keyword)',
      'text-wrap': 'wrap',
      'text-max-width': '150px',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-weight': 'bold',
      grabbable: true,
    },
  },
  {
    selector: 'node.detail-node',
    style: {
      'background-image': 'data(image)',
      'background-fit': 'contain',
      'background-clip': 'none',
      width: 'data(size)',
      height: 'data(size)',
      'text-wrap': 'wrap',
      'text-max-width': '120px',
      'text-valign': 'bottom',
      'text-halign': 'center',
      label: 'data(details)',
      'font-size': '16px',
      'text-margin-y': '15px',
      grabbable: true,
    },
  },
  {
    selector: 'edge',
    style: {
      label: 'data(label)',
      'text-rotation': 'autorotate',
      'font-weight': 'bold',
      'font-size': '20px',
      'text-margin-x': '0px',
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
      ? 100 + ((degree - minDegree) / (maxDegree - minDegree || 1)) * 100
      : 1;

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
        image: `/images/${node.image || ''}`,
        degree: degree,
        size: size,
        details: `${node.description || ''}\n${node.otherinfo || ''}`,
      },
      classes: 'detail-node',
    });
  });

  return elements;
}

export default CanvasBoard;
