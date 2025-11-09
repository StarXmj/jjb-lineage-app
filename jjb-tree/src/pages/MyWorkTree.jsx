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
import { useAuth } from '../AuthContext'; 
import dagre from '@dagrejs/dagre';
import { 
  FaInstagram, FaWikipediaW, FaLink, FaFacebook,
  FaInfoCircle, FaCalendarAlt, FaUser, FaUserCheck,
  FaSpinner, FaPlus, FaPencilAlt, FaTrash, FaArrowLeft
} from 'react-icons/fa'; 
import { beltList, countryList } from '../data.js';
import Select from 'react-select'; // <-- NOUVEL IMPORT
// --- 1. FONCTIONS HELPER ---
const countryOptions = countryList.map(country => ({
  value: country.name, // La valeur sauvegardée est le Nom (ex: "Brazil")
  label: `${country.name} (${country.code})` // Ce qui est affiché (ex: "Brazil (BR)")
}));
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
    
    // NOUVELLE LOGIQUE : Gérer les nationalités multiples
    const nationalities = data.nationalite_nom ? data.nationalite_nom.split(', ') : [];

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
        
        {/* === SECTION NATIONALITÉ MISE À JOUR === */}
        {nationalities.length > 0 && nationalities.map(natName => {
          // On cherche le pays dans notre liste
          const country = countryList.find(c => c.name === natName.trim());
          // On génère l'URL du drapeau
          const flagUrl = country ? `https://flagsapi.com/${country.code}/flat/32.png` : null;

          return (
            <div key={natName} className="info-item">
              {flagUrl ? (
                <img 
                  src={flagUrl} 
                  alt={natName} 
                  className="info-icon image-icon" 
                  style={{ width: '32px', height: '32px' }} // Taille drapeau
                />
              ) : (
                <div style={{width: '32px', marginRight: '10px'}} /> // Placeholder
              )}
              <span>{natName}</span>
            </div>
          );
        })}
        {/* ======================================= */}
        
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

// --- 4. FONCTION DE FORMATAGE ---
const formatMyWorkData = (relevantValidPersons, personSubmissions, relationSubmissions) => {

  const nodeMap = new Map();

  // 1. Ajouter les personnes valides pertinentes (ex: Rickson)
  relevantValidPersons.forEach(personne => {
    nodeMap.set(String(personne.id), {
      id: String(personne.id),
      data: {
        label: `${personne.nom_prenom} (✅ Validé)`,
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
        date_mise_a_jour: personne.date_mise_a_jour,
        _status: 'validated'
      }
    });
  });

  // 2. Ajouter VOS soumissions de personnes (ex: Mon Élève)
  personSubmissions.forEach(personne => {
    nodeMap.set(String(personne.id), { 
      id: String(personne.id),
      data: {
        label: `${personne.nom_prenom} (⌛ En attente)`,
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
        date_mise_a_jour: personne.date_mise_a_jour,
        _status: 'pending'
      }
    });
  });
  
  const allNodesData = Array.from(nodeMap.values());

  // 3. Ajouter VOS soumissions de relations
  const allEdgesData = relationSubmissions.map(relation => ({
    id: String(relation.id),
    source: String(relation.source), 
    target: String(relation.target),
    label: relation.label,
    animated: true, 
    data: {
      contexte_remise_ceinture: relation.contexte_remise_ceinture,
      source: relation.source_info,
      _status: 'pending'
    }
  }));
  
  return { nodes: allNodesData, edges: allEdgesData };
};

// --- 5. FORMULAIRES DE SOUMISSION (CRUD) ---

// --- 5. FORMULAIRES DE SOUMISSION (CRUD) ---

// --- 5. FORMULAIRES DE SOUMISSION (CRUD) ---

function PersonForm({ user, initialData, onCancel, onSubmissionSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // L'état de base, nationalite_nom est vide
  const [formData, setFormData] = useState({
    nom_prenom: '', bio: '', grade_nom: '', image: '', 
    wikipedia: '', instagram: '', facebook: '', website: '', source: ''
  });
  // L'état pour react-select (doit être séparé)
  const [nationalities, setNationalities] = useState([]);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isEditing) {
      // Remplir les champs texte
      setFormData({
        nom_prenom: initialData.nom_prenom || '',
        bio: initialData.bio || '',
        grade_nom: initialData.grade_nom || '',
        image: initialData.image || '',
        wikipedia: initialData.wikipedia || '',
        instagram: initialData.instagram || '',
        facebook: initialData.facebook || '',
        website: initialData.website || '',
        source: initialData.source || ''
      });

      // Remplir react-select (convertir le string en tableau d'objets)
      const natStrings = initialData.nationalite_nom ? initialData.nationalite_nom.split(', ') : [];
      const natObjects = natStrings.map(nat => ({ value: nat, label: nat }));
      setNationalities(natObjects);

    } else {
      // Si on crée, s'assurer que tout est vide
      setFormData({
        nom_prenom: '', bio: '', grade_nom: '', image: '', wikipedia: '', instagram: '', facebook: '', website: '', source: ''
      });
      setNationalities([]);
    }
  }, [initialData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler SÉPARÉ pour react-select
  const handleNationalityChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.length > 3) {
      setMessage("Vous ne pouvez sélectionner que 3 nationalités maximum.");
    } else {
      setMessage('');
      setNationalities(selectedOptions || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // On combine les données du formulaire et de react-select
    const submissionData = {
      ...formData,
      // On re-transforme le tableau d'objets en simple string
      nationalite_nom: nationalities.map(opt => opt.value).join(', ')
    };

    let error;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('persons')
        .update(submissionData)
        .eq('id', initialData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('persons')
        .insert({ ...submissionData, submitted_by: user.id, status: 'pending' });
      error = insertError;
    }

    if (error) {
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage(isEditing ? 'Personne modifiée !' : 'Personne soumise !');
      onSubmissionSuccess();
    }
    setLoading(false);
  };

  return (
    <form className="submission-form" onSubmit={handleSubmit}>
      <div className="list-header">
        <h4>{isEditing ? 'Modifier la Personne' : 'Nouvelle Personne'}</h4>
        <button type="button" className="icon-button" onClick={onCancel} title="Retour à la liste">
          <FaArrowLeft />
        </button>
      </div>

      {message && <div className={message.startsWith('Erreur') ? 'auth-error' : 'auth-success'}>{message}</div>}

      <label>Nom Prénom (Requis)</label>
      <input type="text" name="nom_prenom" value={formData.nom_prenom} onChange={handleChange} required />

      <div className="form-grid">
        <div>
          <label>Grade (Requis)</label>
          {/* TOUJOURS UN SELECT, MAIS POUR LE GRADE */}
          <select name="grade_nom" value={formData.grade_nom} onChange={handleChange} required>
            <option value="">-- Choisir un grade --</option>
            {beltList.map(belt => (
              <option key={belt} value={belt}>{belt}</option>
            ))}
          </select>
        </div>
        
      </div>
      <label>Biographie</label>
      <textarea name="bio" value={formData.bio} onChange={handleChange}></textarea>

      {/* === LE NOUVEAU COMPOSANT INTERACTIF === */}
      <label>Nationalité (3 max)</label>
      <Select
        isMulti
        name="nationalite_nom"
        options={countryOptions}
        className="react-select-container"
        classNamePrefix="react-select"
        value={nationalities}
        onChange={handleNationalityChange}
        placeholder="Tapez pour rechercher un pays..."
        noOptionsMessage={() => "Aucun pays trouvé"}
        // Gère la limite de 3
        isOptionDisabled={() => nationalities.length >= 3} 
      />
      {/* ======================================= */}

      <label>Image (URL)</label>
      <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
      <label>Réseaux (URLs)</label>
      <div className="form-grid">
        <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram" />
        <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="Facebook" />
        <input type="text" name="wikipedia" value={formData.wikipedia} onChange={handleChange} placeholder="Wikipedia" />
        <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="Site Web" />
      </div>
      <div>
          <label>Source (Requis)</label>
          <textarea type="text" name="source" value={formData.source} onChange={handleChange} required />
        </div>
      <button type="submit" className="submission-button" disabled={loading}>{loading ? 'Envoi...' : (isEditing ? 'Mettre à jour' : 'Soumettre')}</button>
    </form>
  );
}

// --- 5. FORMULAIRES DE SOUMISSION (CRUD) ---

// ... (Gardez votre PersonForm tel quel) ...

function RelationForm({ user, personsList, initialData, onCancel, onSubmissionSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // CORRECTION : 'label' a été supprimé de l'état
  const [formData, setFormData] = useState({
    source: '', target: '', contexte_remise_ceinture: '', source_info: ''
  });

  const isEditing = !!initialData;

  useEffect(() => {
    if (isEditing) {
      // CORRECTION : 'label' a été supprimé d'ici
      setFormData({
        source: initialData.source || '',
        target: initialData.target || '',
        contexte_remise_ceinture: initialData.contexte_remise_ceinture || '',
        source_info: initialData.source_info || ''
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.source === formData.target) {
      setMessage('Le maître et l\'élève ne peuvent pas être la même personne.');
      setLoading(false);
      return;
    }

    // CORRECTION : On ajoute 'label' automatiquement ici
    const submissionData = {
      source: formData.source,
      target: formData.target,
      label: 'Maître / Élève', // <-- AUTOMATIQUEMENT DÉFINI
      contexte_remise_ceinture: formData.contexte_remise_ceinture,
      source_info: formData.source_info,
    };
    
    let error;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('relations')
        .update(submissionData)
        .eq('id', initialData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('relations')
        .insert({ ...submissionData, submitted_by: user.id, status: 'pending' });
      error = insertError;
    }
    
    if (error) {
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage(isEditing ? 'Relation modifiée !' : 'Relation soumise !');
      onSubmissionSuccess();
    }
    setLoading(false);
  };

  return (
    <form className="submission-form" onSubmit={handleSubmit}>
      <div className="list-header">
        <h4>{isEditing ? 'Modifier la Relation' : 'Nouvelle Relation'}</h4>
        <button type="button" className="icon-button" onClick={onCancel} title="Retour à la liste">
          <FaArrowLeft />
        </button>
      </div>
      
      {message && <div className={message.startsWith('Erreur') ? 'auth-error' : 'auth-success'}>{message}</div>}
      
      <p style={{fontSize: '0.9em', color: '#555'}}>Créez un lien entre deux personnes (validées ou vos soumissions).</p>
      
      <label>Le Maître (Source)</label>
      <select name="source" value={formData.source} onChange={handleChange} required>
        <option value="">-- Choisir un maître --</option>
        {personsList.map(person => (
          <option key={person.id} value={person.id}>{person.nom_prenom}</option>
        ))}
      </select>
      
      <label>L'Élève (Cible)</label>
      <select name="target" value={formData.target} onChange={handleChange} required>
        <option value="">-- Choisir un élève --</option>
        {personsList.map(person => (
          <option key={person.id} value={person.id}>{person.nom_prenom}</option>
        ))}
      </select>

      {/* CORRECTION : La grille a disparu */}

      <label>Contexte (Où, quand, quelle ceinture?)</label>
      <textarea name="contexte_remise_ceinture" value={formData.contexte_remise_ceinture} onChange={handleChange}></textarea>
      
      {/* CORRECTION : Le champ Source est maintenant seul */}
      <label>Source de l'info (Requis)</label>
      <input type="text" name="source_info" value={formData.source_info} onChange={handleChange} placeholder="ex: bjjheroes.com, post instagram..." required />

      <button type="submit" className="submission-button" disabled={loading}>{loading ? 'Envoi...' : (isEditing ? 'Mettre à jour' : 'Soumettre')}</button>
    </form>
  );
}


// --- 6. COMPOSANT PRINCIPAL DE L'ARBRE ---
const stableNodeTypes = {};
const stableEdgeTypes = {};

function JJBMyWorkTree() {
  const { user } = useAuth(); 
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fitView } = useReactFlow();
  
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [personsList, setPersonsList] = useState([]);
  
  const [personSubmissions, setPersonSubmissions] = useState([]);
  const [relationSubmissions, setRelationSubmissions] = useState([]);
  const [view, setView] = useState({ tab: 'person', mode: 'list' });
  const [editingItem, setEditingItem] = useState(null);

  // --- LOGIQUE DE CHARGEMENT ---
  // --- LOGIQUE DE CHARGEMENT (CORRIGÉE ET FUSIONNÉE) ---
  const fetchMyData = async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    
    try {
      // 1. Fetcher VOS soumissions de personnes (pour la LISTE et l'ARBRE)
      let { data: myPersonSubs, error: pSubError } = await supabase
        .from('persons')
        .select('*')
        .eq('submitted_by', user.id)
        .eq('status', 'pending');
      if (pSubError) throw pSubError;

      // 2. Fetcher VOS soumissions de relations (pour la LISTE et l'ARBRE)
      let { data: myRelationSubs, error: rSubError } = await supabase
        .from('relations')
        .select('*')
        .eq('submitted_by', user.id)
        .eq('status', 'pending');
      if (rSubError) throw rSubError;

      // --- [PARTIE DE LA VERSION 2] ---
      // On met à jour l'état de la LISTE (le CRUD) immédiatement
      setPersonSubmissions(myPersonSubs || []);
      setRelationSubmissions(myRelationSubs || []);
      // --- [FIN DE LA PARTIE 2] ---

      // 3. Extraire les IDs de personnes publiques de vos relations
      const personIdsFromRelations = new Set();
      (myRelationSubs || []).forEach(r => {
        personIdsFromRelations.add(String(r.source));
        personIdsFromRelations.add(String(r.target));
      });
      
      const personIdList = Array.from(personIdsFromRelations);
      
      let relevantValidPersons = [];
      if (personIdList.length > 0) {
        // 4. Fetcher les fiches de ces personnes dans la table PUBLIQUE
        let { data: personsData, error: personsError } = await supabase
          .from('persons')
          .select('*')
          .in('id', personIdList); // On ne fetch que les IDs pertinents
        if (personsError) throw personsError;
        relevantValidPersons = personsData;
      }

      // 5. On formate et on FUSIONNE le tout pour l'arbre
      const { nodes: formattedNodes, edges: formattedEdges } = formatMyWorkData(
        relevantValidPersons || [],
        myPersonSubs || [],
        myRelationSubs || [] // On ne passe QUE vos relations
      );
      
      // 6. On calcule le layout
      const { nodes: layoutedNodes, edges: finalEdges } = getLayoutedElements(
        formattedNodes, 
        formattedEdges // On passe seulement vos liens
      );

      setNodes(layoutedNodes);
      setEdges(finalEdges);

    } catch (error) {
      console.error("Erreur chargement 'My Work':", error.message);
    }
    setIsLoading(false);
  };
  const fetchPersonsList = async () => {
    if (!user) return;
    
    let { data: validPersons, error: error1 } = await supabase.from('persons').select('id, nom_prenom');
    let { data: myPendingPersons, error: error2 } = await supabase.from('persons').select('id, nom_prenom, status').eq('status', 'pending').eq('submitted_by', user.id);
    if (error1 || error2) { console.error(error1 || error2); return; }
    const formattedValid = (validPersons || []).map(p => ({ id: p.id, nom_prenom: `${p.nom_prenom} (✅ Validé)` }));
    const formattedPending = (myPendingPersons || []).map(p => ({ id: p.id, nom_prenom: `${p.nom_prenom} (⌛ Mon travail)` }));
    const allPersons = [...formattedValid, ...formattedPending].sort((a, b) => a.nom_prenom.localeCompare(b.nom_prenom));
    setPersonsList(allPersons);
  };

  // --- LOGIQUE DE CHARGEMENT (CORRIGÉE) ---

  // 1. Charge les données de l'arbre ET les listes du panneau
  useEffect(() => {
    // Si l'utilisateur change (login/logout), on re-charge tout
    if (user) {
      fetchMyData();
      fetchPersonsList();
    }
  }, [user]); // <-- NE DÉPEND QUE DE 'user'

  // 2. Centre la vue APRES que les données soient chargées
  useEffect(() => {
    if (!isLoading && nodes.length > 0) {
      setTimeout(() => fitView(), 100);
    }
  }, [isLoading, nodes, fitView]); // Ne dépend que de ce qui est nécessaire

  // --- HANDLERS POUR LE PANNEAU ---
  
  const handleSetView = (tab, mode, item = null) => {
    setView({ tab, mode });
    setEditingItem(item);
  };
  
  const handleSubmissionSuccess = () => {
    fetchMyData();
    fetchPersonsList();
    setView({ ...view, mode: 'list' });
  };
  
  const handleDelete = async (id, table) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette soumission ?")) return;

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      alert(error.message);
    } else {
      alert("Soumission supprimée !");
      handleSubmissionSuccess();
    }
  };

  // --- Fonctions de clic (Standard) ---
  const onNodeClick = (event, node) => { setSelectedNode(node); setSelectedEdge(null); };
  const onEdgeClick = (event, edge) => { setSelectedEdge(edge); setSelectedNode(null); };
  const onPaneClick = () => { setSelectedNode(null); setSelectedEdge(null); };

  if (isLoading) {
    return (
      <div style={{width: '100vw', height: '100vh', display: 'grid', placeItems: 'center'}}>
        <h1><FaSpinner className="spin" /> Chargement de votre travail...</h1>
      </div>
    );
  }

  // --- LE JSX FINAL ---
  return (
    <div className="layout-my-work">
      
      {/* 1. PANNEAU DE SOUMISSION (GAUCHE) */}
      <div className={`panel-submission ${isPanelOpen ? 'open' : 'closed'}`}>
        <div className="panel-submission-content">
          
          <div className="submission-header">
            <p className="welcome-message">
              Bienvenue, <strong>{user.email}</strong>
            </p>
            <h3>Mon Travail</h3>
            <div className="tab-buttons">
              <button
                className={`tab-button ${view.tab === 'person' ? 'active' : ''}`}
                onClick={() => setView({ tab: 'person', mode: 'list' })}
              >
                Personnes
              </button>
              <button
                className={`tab-button ${view.tab === 'relation' ? 'active' : ''}`}
                onClick={() => setView({ tab: 'relation', mode: 'list' })}
              >
                Relations
              </button>
            </div>
          </div>

          <div className="tab-content">
            {view.tab === 'person' && (
              <>
                {view.mode === 'list' && (
                  <div className="submission-list-view">
                    <div className="list-header">
                      <h4>Mes Personnes Soumises</h4>
                      <button className="icon-button add" onClick={() => handleSetView('person', 'create')} title="Ajouter une personne">
                        <FaPlus />
                      </button>
                    </div>
                    <div className="submission-list">
                      {personSubmissions.map(item => (
                        <div key={item.id} className="list-item">
                          <span className="list-item-label" onClick={() => handleSetView('person', 'edit', item)}>
                            {item.nom_prenom}
                          </span>
                          <div className="list-item-controls">
                            <button className="icon-button edit" onClick={() => handleSetView('person', 'edit', item)}><FaPencilAlt /></button>
                            <button className="icon-button delete" onClick={() => handleDelete(item.id, 'persons')}><FaTrash /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {view.mode === 'create' && (
                  <PersonForm 
                    user={user} 
                    onCancel={() => handleSetView('person', 'list')}
                    onSubmissionSuccess={handleSubmissionSuccess}
                  />
                )}
                
                {view.mode === 'edit' && (
                  <PersonForm 
                    user={user} 
                    initialData={editingItem}
                    onCancel={() => handleSetView('person', 'list')}
                    onSubmissionSuccess={handleSubmissionSuccess}
                  />
                )}
              </>
            )}

            {view.tab === 'relation' && (
              <>
                {view.mode === 'list' && (
                  <div className="submission-list-view">
                    <div className="list-header">
                      <h4>Mes Relations Soumises</h4>
                      <button className="icon-button add" onClick={() => handleSetView('relation', 'create')} title="Ajouter une relation">
                        <FaPlus />
                      </button>
                    </div>
                    <div className="submission-list">
                      {relationSubmissions.map(item => (
                        <div key={item.id} className="list-item">
                          <span className="list-item-label" onClick={() => handleSetView('relation', 'edit', item)}>
                            {item.label || 'Relation sans nom'} ({item.status})
                          </span>
                          <div className="list-item-controls">
                            <button className="icon-button edit" onClick={() => handleSetView('relation', 'edit', item)}><FaPencilAlt /></button>
                            <button className="icon-button delete" onClick={() => handleDelete(item.id, 'relations')}><FaTrash /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(view.mode === 'create' || view.mode === 'edit') && (
                  <RelationForm 
                    user={user}
                    personsList={personsList}
                    initialData={view.mode === 'edit' ? editingItem : null}
                    onCancel={() => handleSetView('relation', 'list')}
                    onSubmissionSuccess={handleSubmissionSuccess}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. BOUTON TOGGLE */}
      <button 
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`panel-toggle-button ${isPanelOpen ? 'panel-open' : 'panel-closed'}`}
      >
        {isPanelOpen ? '<' : '>'}
      </button>

      {/* 3. ARBRE (CENTRE) */}
      <div className="flow-container-my-work">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={stableNodeTypes}
          edgeTypes={stableEdgeTypes}

          nodesDraggable={false}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      
      {/* 4. INFOPANEL (DROITE) */}
      <InfoPanel 
        selectedNode={selectedNode} 
        selectedEdge={selectedEdge} 
        nodes={nodes} 
      />
    </div>
  );
}

// --- 7. EXPORTATION ---
export default function MyWorkTree() {
  return (
    <ReactFlowProvider>
      <JJBMyWorkTree />
    </ReactFlowProvider>
  );
}