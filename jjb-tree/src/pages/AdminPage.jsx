import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './TreePage.css'; // On réutilise le CSS
import { FaSpinner, FaPencilAlt, FaTrash, FaArrowLeft } from 'react-icons/fa';

// --- Formulaire/Détail pour une PERSONNE (Admin) ---
// (C'est ce qui s'ouvre quand on clique sur la "flèche")

//  ✅  LA CORRECTION EST ICI (J'ai renommé "PersonAdminDetails" en "PersonDetails")
function PersonDetails({ item, onBack, onStatusChange, processing }) {
  
  // Fonction interne pour gérer le clic sur un bouton radio
  const handleRadioChange = (newStatus) => {
    if (processing) return; // Empêche les double-clics
    onStatusChange(item, 'persons', newStatus); // Appelle la fonction de l'AdminPage
  };

  return (
    <div className="submission-form">
      <div className="list-header">
        <h4>Détails : {item.nom_prenom}</h4>
        <button type="button" className="icon-button" onClick={onBack} title="Retour à la liste">
          <FaArrowLeft />
        </button>
      </div>

      {/* Affiche les champs en lecture seule */}
      <label>Nom Prénom</label>
      <input type="text" value={item.nom_prenom || ''} disabled />
      
      <div className="form-grid">
        <div>
          <label>Grade</label>
          <input type="text" value={item.grade_nom || ''} disabled />
        </div>
        <div>
          <label>Source</label>
          <input type="text" value={item.source || ''} disabled />
        </div>
      </div>
      <label>Biographie</label>
      <textarea value={item.bio || ''} disabled></textarea>
      <div className="form-grid">
        <div>
          <label>Nationalité</label>
          <input type="text" value={item.nationalite_nom || ''} disabled />
        </div>
        <div>
          <label>Icône (URL)</label>
          <input type="text" value={item.nationalite_icon || ''} disabled />
        </div>
      </div>
      <label>Image (URL)</label>
      <input type="text" value={item.image || ''} disabled />
      <label>Réseaux (URLs)</label>
      <div className="form-grid">
        <input type="text" value={item.instagram || ''} placeholder="Instagram" disabled />
        <input type="text" value={item.facebook || ''} placeholder="Facebook" disabled />
        <input type="text" value={item.wikipedia || ''} placeholder="Wikipedia" disabled />
        <input type="text" value={item.website || ''} placeholder="Site Web" disabled />
      </div>
      
      <hr />
      <label>Changer le Statut :</label>
      {processing ? <FaSpinner className="spin" /> : (
        <div className="status-radio-group">
          <label className={item.status === 'pending' ? 'active' : ''} htmlFor={`status-${item.id}-pending`}>
            <input 
              type="radio" 
              name={`status-${item.id}`} 
              id={`status-${item.id}-pending`}
              checked={item.status === 'pending'} 
              onChange={() => handleRadioChange('pending')}
            /> En attente
          </label>
          <label className={item.status === 'valider' ? 'active' : ''} htmlFor={`status-${item.id}-valider`}>
            <input 
              type="radio" 
              name={`status-${item.id}`}
              id={`status-${item.id}-valider`}
              checked={item.status === 'valider'} 
              onChange={() => handleRadioChange('valider')}
            /> Valider
          </label>
          <label className={item.status === 'non-valid' ? 'active' : ''} htmlFor={`status-${item.id}-non-valid`}>
            <input 
              type="radio" 
              name={`status-${item.id}`}
              id={`status-${item.id}-non-valid`}
              checked={item.status === 'non-valid'} 
              onChange={() => handleRadioChange('non-valid')}
            /> Non-valid
          </label>
          <label className={item.status === 'suspendu' ? 'active' : ''} htmlFor={`status-${item.id}-suspendu`}>
            <input 
              type="radio" 
              name={`status-${item.id}`}
              id={`status-${item.id}-suspendu`}
              checked={item.status === 'suspendu'} 
              onChange={() => handleRadioChange('suspendu')}
            /> Suspendu
          </label>
        </div>
      )}
    </div>
  );
}

// --- Formulaire/Détail pour une RELATION (Admin) ---
function RelationDetails({ item, onBack, onStatusChange, processing }) {

  const handleRadioChange1 = (newStatus) => {
    if (processing) return;
    onStatusChange(item, 'relations', newStatus);
  };

  return (
    <div className="submission-form">
      <div className="list-header">
        <h4>Détails : {item.label || 'Relation'}</h4>
        <button type="button" className="icon-button" onClick={onBack} title="Retour à la liste">
          <FaArrowLeft />
        </button>
      </div>

      <div className="form-grid">
        <div>
          <label>Maître (ID Source)</label>
          <input type="text" value={item.source || ''} disabled />
        </div>
        <div>
          <label>Élève (ID Cible)</label>
          <input type="text" value={item.target || ''} disabled />
        </div>
      </div>
      <label>Contexte</label>
      <textarea value={item.contexte_remise_ceinture || ''} disabled></textarea>
      <label>Source de l'info</label>
      <input type="text" value={item.source_info || ''} disabled />
      
      <hr />
      <label>Changer le Statut :</label>
      {processing ? <FaSpinner className="spin" /> : (
        <div className="status-radio-group">
          <label className={item.status === 'pending' ? 'active' : ''} htmlFor={`status-${item.id}-pending`}>
            <input type="radio" name={`status-${item.id}`} id={`status-${item.id}-pending`} checked={item.status === 'pending'} onChange={() => handleRadioChange1('pending')}/> En attente
          </label>
          <label className={item.status === 'valider' ? 'active' : ''} htmlFor={`status-${item.id}-valider`}>
            <input type="radio" name={`status-${item.id}`} id={`status-${item.id}-valider`} checked={item.status === 'valider'} onChange={() => handleRadioChange1('valider')}/> Valider
          </label>
          <label className={item.status === 'non-valid' ? 'active' : ''} htmlFor={`status-${item.id}-non-valid`}>
            <input type="radio" name={`status-${item.id}`} id={`status-${item.id}-non-valid`} checked={item.status === 'non-valid'} onChange={() => handleRadioChange1('non-valid')}/> Non-valid
          </label>
          <label className={item.status === 'suspendu' ? 'active' : ''} htmlFor={`status-${item.id}-suspendu`}>
            <input type="radio" name={`status-${item.id}`} id={`status-${item.id}-suspendu`} checked={item.status === 'suspendu'} onChange={() => handleRadioChange1('suspendu')}/> Suspendu
          </label>
        </div>
      )}
    </div>
  );
}


// --- COMPOSANT PRINCIPAL (AdminPage) ---
export default function AdminPage() {
  const [persons, setPersons] = useState([]);
  const [relations, setRelations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: 'auth-success', content: '' });
  const [activeTab, setActiveTab] = useState('person');
  const [processingId, setProcessingId] = useState(null);

  const [view, setView] = useState('list'); 
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchAllSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data: personsData, error: pError } = await supabase
        .from('persons')
        .select(`
          *,
          profile:submitted_by ( email )
        `);
      
      const { data: relationsData, error: rError } = await supabase
        .from('relations')
        .select(`
          *,
          profile:submitted_by ( email )
        `);

      if (pError) throw pError;
      if (rError) throw rError;

      const sortedPersons = (personsData || []).sort((a, b) => (a.status === 'pending' ? -1 : 1));
      const sortedRelations = (relationsData || []).sort((a, b) => (a.status === 'pending' ? -1 : 1));

      setPersons(sortedPersons);
      setRelations(sortedRelations);

    } catch (error) {
      setMessage({ type: 'auth-error', content: `Erreur: ${error.message}` });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  // Fonction générale pour mettre à jour le statut
  const handleSetStatus = async (id, table, newStatus) => {
    setProcessingId(id);
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      setMessage({ type: 'auth-error', content: `Erreur: ${error.message}` });
    } else {
      setMessage({ type: 'auth-success', content: `Statut mis à jour en '${newStatus}'`});
      // Rafraîchir la liste et retourner à la vue liste
      fetchAllSubmissions();
      setView('list'); 
      setSelectedItem(null);
    }
    setProcessingId(null);
  };
  
  // Handler pour les boutons radio
  const onStatusChange = (item, type, newStatus) => {
    const table = type === 'person' ? 'persons' : 'relations';
    handleSetStatus(item.id, table, newStatus);
  };

  // Handler pour voir les détails
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setView('details');
  };

  // Helper pour afficher les listes
  const renderList = (items, type) => {
    if (items.length === 0) {
      return <p>Aucune soumission trouvée.</p>;
    }

    return (
      <div className="submission-list">
        {items.map(item => {
          const email = item.profile?.email || (item.submitted_by ? item.submitted_by.slice(0, 8) + '...' : 'Inconnu');
          const currentStatus = item.status || 'pending';

          return (
            // "Case" plus grande
            <div key={item.id} className="list-item admin-item"> 
              <div className="admin-item-info">
                <span className="list-item-label">
                  {type === 'person' ? item.nom_prenom : (item.label || 'Relation')}
                </span>
                <small>
                  Soumis par: <strong>{email}</strong>
                </small>
                <small>
                  Statut: <span className={`status-badge ${currentStatus}`}>{currentStatus}</span>
                </small>
              </div>
              
              <div className="admin-item-controls">
                {/* Bouton "flèche" (Modifier/Voir) */}
                <button 
                  className="icon-button edit" 
                  onClick={() => handleViewDetails(item)}
                  title="Voir les détails et valider"
                >
                  <FaPencilAlt />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <div className="dashboard-container"><h2><FaSpinner className="spin" /> Chargement des soumissions...</h2></div>;
  }

  // --- Le JSX Final ---
  return (
    <div className="dashboard-container" style={{maxWidth: '1000px'}}>
      <div className="submission-header">
        <h3>Panneau d'Administration</h3>
        {message.content && <div className={message.type}>{message.content}</div>}
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'person' ? 'active' : ''}`}
            onClick={() => { setActiveTab('person'); setView('list'); }}
          >
            Personnes ({persons.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'relation' ? 'active' : ''}`}
            onClick={() => { setActiveTab('relation'); setView('list'); }}
          >
            Relations ({relations.length})
          </button>
        </div>
      </div>
      
      <div className="tab-content">
        {activeTab === 'person' ? (
          view === 'list' ? 
            renderList(persons, 'person') : 
            <PersonDetails 
              item={selectedItem} 
              onBack={() => setView('list')}
              onStatusChange={onStatusChange}
              processing={processingId === selectedItem?.id}
            />
        ) : (
          view === 'list' ? 
            renderList(relations, 'relation') :
            <RelationDetails
              item={selectedItem}
              onBack={() => setView('list')}
              onStatusChange={onStatusChange}
              processing={processingId === selectedItem?.id}
            />
        )}
      </div>
    </div>
  );
}