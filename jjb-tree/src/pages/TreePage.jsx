import React, { useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
// Les 2 imports CSS essentiels
import 'reactflow/dist/style.css'; 
import './TreePage.css'; 
import { supabase } from '../supabaseClient';
// (pas besoin de useAuth, c'est l'arbre public)

import dagre from '@dagrejs/dagre';
import { 
  FaInstagram, FaWikipediaW, FaLink, FaFacebook,
  FaInfoCircle, FaCalendarAlt, FaUser, FaUserCheck,
  FaSpinner
} from 'react-icons/fa'; 

// --- 1. FONCTIONS HELPER ---

const getBeltColor = (grade) => {
  if (!grade) return '#DDDDDD';
  const gradeLower = grade.toLowerCase();
  if (gradeLower.includes('marron')) return '#904711';
  if (gradeLower.includes('rouge')) return '#E80215';
  if (gradeLower.includes('noire')) return '#000000';
  if (gradeLower.includes('violette')) return '#973AC8';
  if (gradeLower.includes('bleue')) return '#0A65FF';
  return '#DDDDDD';
};

const getBeltIcon = (grade) => {
  if (!grade) return 'ceinture-blanche.png';
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

// --- 2. COMPOSANT INFOPANEL (DROITE) ---
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

// --- 3. FONCTION DE LAYOUT ---
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
    const grade_nom = node.data.grade_nom || '';
    if (grade_nom.toLowerCase().includes('rouge/noire')) {
      className = 'belt-red-black';
    }
    else if (grade_nom.toLowerCase().includes('rouge/blanc')) {
      className = 'belt-red-white';
    }

    const style = {
      borderWidth: '2px', 
      borderStyle: 'solid',
      borderColor: getBeltColor(grade_nom),
    };

    return { ...node, position, style, className };
  });

  return { nodes: layoutedNodes, edges: edges };
};

// --- 4. FONCTION DE FORMATAGE (POUR LES DONNÉES PUBLIQUES) ---
// (Elle est simple : elle lit 'persons' et 'relations')
const formatDataForReactFlow = (persons, relations) => {
  const nodes = persons.map(personne => {
    return {
      id: String(personne.id),
      data: {
        label: personne.nom_prenom,
        nom_prenom: personne.nom_prenom,
        nationalite_nom: personne.nationalite_nom,
        nationalite_icon: personne.nationalite_icon,
        image: personne.image,
        bio: personne.bio,
        grade_nom: personne.grade_nom,
        reseaux_sociaux: {
          wikipedia: personne.wikipedia,
          instagram: personne.instagram,
          facebook: personne.facebook,
          website: personne.website
        },
        source: personne.source,
        date_mise_a_jour: personne.date_mise_a_jour
      }
    };
  });

  const edges = relations.map(relation => {
    return {
      id: String(relation.id),
      source: String(relation.source), // Lit la colonne 'source'
      target: String(relation.target), // Lit la colonne 'target'
      label: relation.label,
      animated: true, 
      data: {
        contexte_remise_ceinture: relation.contexte_remise_ceinture,
        source: relation.source_info
      }
    };
  });
  
  return { nodes, edges };
};

// Objets vides pour corriger l'avertissement React Flow 002
const stableNodeTypes = {};
const stableEdgeTypes = {};

// --- 5. COMPOSANT PRINCIPAL DE L'ARBRE (Logique de chargement PUBLIC) ---
function JJBTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fitView } = useReactFlow();

  // --- CHARGEMENT DES DONNÉES (Version SUPABASE PUBLIQUE) ---
  useEffect(() => {
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let { data: personsData, error: personsError } = await supabase
          .from('persons')
          .select('*')
          .eq('status', 'valider');

        let { data: relationsData, error: relationsError } = await supabase
          .from('relations')
          .select('*')
          .eq('status', 'valider');

        if (personsError) throw personsError;
        if (relationsError) throw relationsError;

        const { nodes: formattedNodes, edges: formattedEdges } = formatDataForReactFlow(
          personsData || [],
          relationsData || []
        );
        
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          formattedNodes,
          formattedEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

      } catch (error) {
        console.error("Erreur chargement Supabase (Public):", error.message);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [setNodes, setEdges]); // On enlève fitView

  // On sépare le fitView pour qu'il s'exécute APRÈS le rendu
  useEffect(() => {
    if (!isLoading && nodes.length > 0) {
      setTimeout(() => fitView(), 100);
    }
  }, [isLoading, nodes, fitView]);

  // --- Fonctions de clic (Standard) ---
  const onNodeClick = (event, node) => { setSelectedNode(node); setSelectedEdge(null); };
  const onEdgeClick = (event, edge) => { setSelectedEdge(edge); setSelectedNode(null); };
  const onPaneClick = () => { setSelectedNode(null); setSelectedEdge(null); };

  if (isLoading) {
    return (
      <div style={{width: '100vw', height: '100vh', display: 'grid', placeItems: 'center'}}>
        <h1><FaSpinner className="spin" /> Chargement de l'arbre principal...</h1>
      </div>
    );
  }

  return (
    // IL UTILISE L'ANCIEN LAYOUT '.app-container' (2 colonnes)
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
          nodeTypes={stableNodeTypes}
          edgeTypes={stableEdgeTypes}
        >
          <Controls />
          <Background />
        </ReactFlow>
        {/* IL N'A PAS DE PANNEAU DE GAUCHE, JUSTE UN BOUTON "CONTRIBUER" */}
        <a 
          href="/dashboard"
          className="add-button"
        >
          + Contribuer
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

// --- 6. EXPORTATION (AVEC LE PROVIDER) ---
export default function TreePage() {
  return (
    <ReactFlowProvider>
      <JJBTree />
    </ReactFlowProvider>
  );
}