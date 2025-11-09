import React, { useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow, // Le hook pour centrer la vue
  ReactFlowProvider // Le composant requis pour le hook
} from 'reactflow';
import 'reactflow/dist/style.css';

import dagre from '@dagrejs/dagre';
import { 
  FaInstagram, FaWikipediaW, FaLink, FaFacebook,
  FaInfoCircle, FaCalendarAlt, FaUser, FaUserCheck,
  FaSpinner // Icône de chargement
} from 'react-icons/fa'; 

// --- 1. FONCTIONS HELPER (VOS FONCTIONS) ---

const getBeltColor = (grade) => {
  const gradeLower = grade.toLowerCase();
  if (gradeLower.includes('marron')) return '#904711';
  if (gradeLower.includes('rouge')) return '#E80215';
  if (gradeLower.includes('noire')) return '#000000';
  if (gradeLower.includes('violette')) return '#973AC8';
  if (gradeLower.includes('bleue')) return '#0A65FF';
  return '#DDDDDD';
};

const getBeltIcon = (grade) => {
  const gradeLower = grade.toLowerCase();
  if (gradeLower.includes('rouge/noire')) return 'ceinture-rouge-noire.png';
  if (gradeLower.includes('rouge/blanc')) return 'ceinture-rouge-blanche.png';
  if (gradeLower.includes('rouge')) return 'ceinture-rouge.png';
  if (gradeLower.includes('marron')) return 'ceinture-marron.png';
  if (gradeLower.includes('noire')) return 'ceinture-noire.png';
  if (gradeLower.includes('violette')) return 'ceinture-violette.png';
  if (gradeLower.includes('bleue')) return 'ceinture-bleue.png';
  return 'ceinture-blanche.png'; 
};

const getSocialIcon = (networkName) => {
  const name = networkName.toLowerCase();
  if (name.includes('instagram')) return <FaInstagram />;
  if (name.includes('wikipedia')) return <FaWikipediaW />;
  if (name.includes('facebook')) return <FaFacebook />;
  if (name.includes('website')) return <FaLink />;
  return <FaLink />;
};

// --- 2. COMPOSANT INFOPANEL (VOTRE COMPOSANT) ---
function InfoPanel({ selectedNode, selectedEdge, nodes }) {
  
  if (selectedNode) {
    const data = selectedNode.data;
    const reseaux = Object.entries(data.reseaux_sociaux || {}).filter(([key, value]) => value);

    return (
      <div className="info-panel">
        <img 
          key={selectedNode.id}
          src={data.image} 
          alt={`Photo de ${data.nom_prenom}`}
          className="info-panel-img"
        />
        <h2 className="panel-title">{data.nom_prenom}</h2>
        
        <div className="info-item">
          <img 
            src={`/icons/${getBeltIcon(data.grade_nom)}`} 
            alt={data.grade_nom} 
            className="info-icon image-icon" 
          />
          <span>{data.grade_nom}</span>
        </div>
        <div className="info-item">
          <img 
            src={data.nationalite_icon} 
            alt={data.nationalite_nom} 
            className="info-icon image-icon" 
          />
          <span>{data.nationalite_nom}</span>
        </div>
        
        <p className="bio">{data.bio}</p>
        <hr />
        <div className="info-item meta-info">
          <FaInfoCircle className="info-icon" />
          <span><strong>Source:</strong> {data.source}</span>
        </div>
        <div className="info-item meta-info">
          <FaCalendarAlt className="info-icon" />
          <span><strong>Dernière MàJ:</strong> {data.date_mise_a_jour}</span>
        </div>
        <hr />

        {reseaux.length > 0 && (
          <div className="reseaux-sociaux">
            <div className="social-icons-container">
              {reseaux.map(([nom, url]) => (
                <a 
                  key={nom} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title={nom}
                  className="social-icon-link"
                >
                  {getSocialIcon(nom)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedEdge) {
    const data = selectedEdge.data;
    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
    const targetNode = nodes.find(n => n.id === selectedEdge.target);

    return (
      <div className="info-panel">
        <h2 className="panel-title">Détail de la Relation</h2>
        <strong>{selectedEdge.label}</strong>
        <div className="info-item">
          <FaUser className="info-icon" />
          <span><strong>De:</strong> {sourceNode ? sourceNode.data.nom_prenom : '...'}</span>
        </div>
        <div className="info-item">
          <FaUserCheck className="info-icon" />
          <span><strong>À:</strong> {targetNode ? targetNode.data.nom_prenom : '...'}</span>
        </div>
        <hr />
        <p><strong>Contexte de la remise de ceinture :</strong></p>
        <p className="bio">{data.contexte_remise_ceinture}</p>
        <hr />
        <div className="info-item meta-info">
          <FaInfoCircle className="info-icon" />
          <span><strong>Source:</strong> {data.source_info}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="info-panel">
      <strong>Cliquez sur une personne ou un lien</strong>
      <p>pour voir les détails.</p>
    </div>
  );
}

// --- 3. FONCTION DE LAYOUT (VOTRE FONCTION, AVEC LE FIX "RANDOM") ---
const nodeWidth = 200; 
const nodeHeight = 50;
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  let layoutEdges = [...edges];
  const connectedNodes = new Set();
  const sourceNodes = new Set();
  const targetNodes = new Set();

  edges.forEach((edge) => {
    const sourceId = String(edge.source);
    const targetId = String(edge.target);
    connectedNodes.add(sourceId);
    connectedNodes.add(targetId);
    sourceNodes.add(sourceId);
    targetNodes.add(targetId);
  });

  const randomNodes = nodes.filter(node => !connectedNodes.has(String(node.id)));
  const leafNodes = Array.from(targetNodes).filter(id => !sourceNodes.has(id));

  if (randomNodes.length > 0 && leafNodes.length > 0) {
    const anchorNodeId = leafNodes[0]; 
    randomNodes.forEach(randomNode => {
      layoutEdges.push({
        id: `fake-link-for-${randomNode.id}`,
        source: anchorNodeId,
        target: randomNode.id,
        style: { display: 'none' }
      });
    });
  }
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  layoutEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    let className = ''; 
    if (node.data.grade_nom.toLowerCase().includes('rouge/noire')) {
      className = 'belt-red-black';
    }
    else if (node.data.grade_nom.toLowerCase().includes('rouge/blanc')) {
      className = 'belt-red-white';
    }

    const style = {
      padding: '10px',
      borderWidth: '2px', 
      borderStyle: 'solid',
      borderColor: getBeltColor(node.data.grade_nom),
    };

    return { ...node, position, style, className };
  });

  return { nodes: layoutedNodes, edges: edges };
};

// --- 4. CONSTANTES ---
// (Mettez votre vrai lien Google Form ici)
const FORM_URL = 'VOTRE_LIEN_GOOGLE_FORM_ICI'; 
const API_URL = '/api/get-tree';
const CLUSTER_THRESHOLD = 15; // Au-dessus de ce nombre, on regroupe

// --- 5. COMPOSANT PRINCIPAL DE L'ARBRE (LA NOUVELLE LOGIQUE) ---
function JJBTree() {
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadedNodeIds, setLoadedNodeIds] = useState(new Set());
  
  const { fitView } = useReactFlow();

  useEffect(() => {
    const fetchRootNodes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL);
        const { nodes: rootNodes, edges: rootEdges } = await response.json();

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rootNodes, rootEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setIsLoading(false);
        setTimeout(fitView, 100); 

      } catch (error) {
        console.error("Impossible de charger les racines :", error);
        setIsLoading(false);
      }
    };
    fetchRootNodes();
  }, [setNodes, setEdges, fitView]);

  const onNodeClick = async (event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);

    // Si c'est un clic sur un cluster, on l'étend
    if (node.data?.type === 'cluster') {
      return onClusterClick(node);
    }
    
    // Si pas d'enfants ou déjà chargé, on ne fait rien
    if (node.data.childCount === 0 || loadedNodeIds.has(node.id)) {
      return;
    }

    try {
      setLoadedNodeIds(new Set(loadedNodeIds).add(node.id)); // Marque comme "en cours"
      
      const response = await fetch(`${API_URL}?parentId=${node.id}`);
      const { nodes: newNodes, edges: newEdges } = await response.json();

      if (node.data.childCount > CLUSTER_THRESHOLD) {
        // --- LOGIQUE DE CLUSTERING ---
        const clusterNode = {
          id: `cluster-${node.id}`,
          data: { 
            label: `Voir les ${node.data.childCount} élèves...`,
            type: 'cluster', // On marque le type
            // On stocke les données pour plus tard
            childrenData: { newNodes, newEdges } 
          },
          // On le positionne sous le parent
          position: { x: node.position.x, y: node.position.y + 100 }
        };
        const clusterEdge = {
          id: `edge-cluster-${node.id}`,
          source: node.id,
          target: clusterNode.id
        };

        setNodes((nds) => [...nds, clusterNode]);
        setEdges((eds) => [...eds, clusterEdge]);
        setTimeout(() => {
            const allNodes = [...nodes, clusterNode];
            const allEdges = [...edges, clusterEdge];
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(allNodes, allEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            setTimeout(fitView, 100);
        }, 100);

      } else {
        // --- LOGIQUE DE LAZY LOADING (SANS CLUSTERING) ---
        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => [...eds, ...newEdges]);
        // On recalcule TOUT le layout
        setTimeout(() => {
            const allNodes = [...nodes, ...newNodes];
            const allEdges = [...edges, ...newEdges];
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(allNodes, allEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            setTimeout(fitView, 100);
        }, 100);
      }

    } catch (error) {
      console.error("Impossible de charger les enfants :", error);
    }
  };

  const onClusterClick = (clusterNode) => {
    const { childrenData } = clusterNode.data;
    
    // 1. On retire le nœud cluster et son lien
    setNodes((nds) => nds.filter(n => n.id !== clusterNode.id));
    setEdges((eds) => eds.filter(e => e.target !== clusterNode.id));
    
    // 2. On ajoute les vrais enfants
    setNodes((nds) => [...nds, ...childrenData.newNodes]);
    setEdges((eds) => [...eds, ...childrenData.newEdges]);

    // 3. On recalcule le layout
    setTimeout(() => {
        // On doit utiliser setNodes.getState() pour avoir la version la plus à jour
        setNodes(nds => {
            const allNodes = nds.filter(n => n.id !== clusterNode.id).concat(childrenData.newNodes);
            const allEdges = edges.filter(e => e.target !== clusterNode.id).concat(childrenData.newEdges);
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(allNodes, allEdges);
            setEdges(layoutedEdges); // Met à jour les arêtes aussi
            return layoutedNodes;
        });
        setTimeout(fitView, 100);
    }, 100);
  };
  
  const onEdgeClick = (event, edge) => { setSelectedEdge(edge); setSelectedNode(null); };
  const onPaneClick = () => { setSelectedNode(null); setSelectedEdge(null); };

  if (isLoading) {
    return (
      <div style={{width: '100vw', height: '100vh', display: 'grid', placeItems: 'center'}}>
        <h1><FaSpinner className="spin" /> Chargement de l'arbre...</h1>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          fitViewOnLoad={false}
        >
          <Controls />
          <Background />
        </ReactFlow>
        <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="add-button">
          + Ajouter un Profil
        </a>
      </div>
      <InfoPanel 
        selectedNode={selectedNode} 
        selectedEdge={selectedEdge} 
        nodes={nodes} 
      />
    </div>
  );
}

// --- 6. LE COMPOSANT D'EXPORTATION FINAL (AVEC LE PROVIDER) ---
export default function App() {
  return (
    // ReactFlowProvider est NÉCESSAIRE pour que useReactFlow() fonctionne
    <ReactFlowProvider>
      <JJBTree />
    </ReactFlowProvider>
  );
}