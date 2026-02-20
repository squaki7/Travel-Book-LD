import React, { useState, useEffect, useCallback } from 'react';
import type { ItineraryModel, Passenger, Day, Hotel, DayItem, HotelStay, RouteMap, PortalLink } from './types';
import { buildItineraryModel, stringifyItinerary } from './services/itineraryParser';

type Language = 'en' | 'es';

const translations = {
  en: {
    title: 'Travel Book',
    whoTraveling: 'Who is Traveling?',
    tripSummary: 'Trip Summary',
    detailedItinerary: 'Detailed Itinerary',
    hotelInfo: 'Hotel Information',
    practicalInfo: 'Essential Practical Information',
    emergencyContacts: 'Emergency Contacts and Coordination',
    updateButton: 'Update Itinerary',
    exportHtml: 'Export HTML',
    exportText: 'Export Text',
    editText: 'Edit Mode',
    saveText: 'Finish Editing',
    placeholder: 'Paste your .txt content here...',
    successUpdate: 'Itinerary updated successfully! ✨',
    errorUpdate: 'Please enter itinerary text to update.',
    nationality: 'Nationality',
    passport: 'Passport',
    dob: 'Date of Birth',
    room: 'Room',
    dayLabel: 'DAY',
    dateLabel: 'Date',
    accLabel: 'Accommodation',
    mealsLabel: 'Meals',
    inclLabel: 'Includes',
    flightLabel: 'Flight',
    addrLabel: 'Address',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    resLabel: 'Reservation No.',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    nights: 'Duration of Stay',
    services: 'Services',
    addPassenger: 'Add Passenger',
    addDay: 'Add Day',
    addHotel: 'Add Hotel',
    addItem: 'Add Item',
    addStay: 'Add Stay',
    agency: 'Travel Agency',
    mainNationality: 'Main Nationality',
    agencyContact: 'Agency Contact',
    routeCreator: 'Route Map Creator',
    selectDay: 'Select Day',
    origin: 'Origin',
    destination: 'Destination',
    addMap: 'Add Route Map',
    removeMap: 'Remove Map',
    existingMapsForDay: 'Current maps for this day',
    portalManager: 'Portal Links Manager',
    countryName: 'Country Name',
    urlLabel: 'Travel Book URL',
    addPortalLink: 'Add Link to Portal',
    exportPortal: 'Export Portal Landing',
    back: 'BACK',
    welcomePortal: 'Welcome to your Travel Book',
    selectCountry: 'Select the country you wish to view',
    viewItineraryFor: 'View Itinerary for'
  },
  es: {
    title: 'Diario de Viaje',
    whoTraveling: '¿Quién Viaja?',
    tripSummary: 'Resumen del Viaje',
    detailedItinerary: 'Itinerario Detallado',
    hotelInfo: 'Información sobre los Hoteles',
    practicalInfo: 'Información Práctica Esencial',
    emergencyContacts: 'Contactos de Emergencia y Coordinación',
    updateButton: 'Actualizar Itinerario',
    exportHtml: 'Exportar HTML',
    exportText: 'Exportar Texto',
    editText: 'Modo Edición',
    saveText: 'Terminar Edición',
    placeholder: 'Pegue el contenido .txt aquí...',
    successUpdate: '¡Itinerario actualizado con éxito! ✨',
    errorUpdate: 'Por favor, ingrese el texto del itinerario.',
    nationality: 'Nacionalidad',
    passport: 'Pasaporte',
    dob: 'Fecha de Nacimiento',
    room: 'Habitación',
    dayLabel: 'DÍA',
    dateLabel: 'Fecha',
    accLabel: 'Alojamiento',
    mealsLabel: 'Comidas',
    inclLabel: 'Servicios incluidos',
    flightLabel: 'Vuelo',
    addrLabel: 'Dirección',
    phoneLabel: 'Teléfono',
    emailLabel: 'Email',
    resLabel: 'Número de Reserva',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    nights: 'Duración de la Estancia',
    services: 'Servicios',
    addPassenger: 'Agregar Pasajero',
    addDay: 'Agregar Día',
    addHotel: 'Agregar Hotel',
    addItem: 'Agregar Ítem',
    addStay: 'Agregar Estancia',
    agency: 'Agencia',
    mainNationality: 'Nacionalidad',
    agencyContact: 'Contacto de la Agencia',
    routeCreator: 'Creador de Rutas en Mapa',
    selectDay: 'Seleccionar Día',
    origin: 'Lugar de Origen',
    destination: 'Lugar de Llegada',
    addMap: 'Agregar Mapa de Ruta',
    removeMap: 'Eliminar Mapa',
    existingMapsForDay: 'Mapas actuales de este día',
    portalManager: 'Gestor de Enlaces del Portal',
    countryName: 'Nombre del País',
    urlLabel: 'URL del Travel Book',
    addPortalLink: 'Agregar al Portal',
    exportPortal: 'Exportar Portal',
    back: 'ATRÁS',
    welcomePortal: 'Welcome to your Travel Book',
    selectCountry: 'Select the country you wish to view',
    viewItineraryFor: 'Ver Itinerario de'
  }
};

const COUNTRY_FLAGS: Record<string, string> = {
  'peru': 'pe', 'perú': 'pe', 'bolivia': 'bo', 'chile': 'cl', 'ecuador': 'ec',
  'colombia': 'co', 'argentina': 'ar', 'brazil': 'br', 'brasil': 'br',
  'mexico': 'mx', 'méxico': 'mx', 'france': 'fr', 'francia': 'fr'
};

const getFlagUrl = (countryName: string) => {
  const normalized = countryName.toLowerCase().trim().replace(/\s+/g, ' ');
  const code = COUNTRY_FLAGS[normalized] || 'un';
  return `https://flagcdn.com/w80/${code}.png`;
};
const initialItineraryState: ItineraryModel = {
  mainHeader: {
    title: 'Travel Book',
    subtitle: 'Group F07-148-25 Klein x 04',
    agency: 'First Travel',
    nationality: 'French',
    agency_contact: 'Gaston-Sacaze Peru',
  },
  passengers: [],
  overview: 'This detailed itinerary will guide you through the wonders of Peru...',
  days: [],
  hotels: [],
  practicalInfo: [],
  emergency: [],
  portalLinks: []
};

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const EditIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
);

const MapIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l5-2.5 5.553 2.776a1 1 0 01.447.894v10.764a1 1 0 01-1.447.894L15 17l-6 3z" /></svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
);

const MessageBox: React.FC<{ message: string; type: 'success' | 'error'; onHide: () => void }> = ({ message, type, onHide }) => {
  useEffect(() => {
    const timer = setTimeout(onHide, 5000);
    return () => clearTimeout(timer);
  }, [onHide]);
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className={`message-box fixed top-5 right-5 text-white p-4 rounded-lg shadow-lg z-[100] flex items-center gap-3 ${bgColor}`}>
      <p>{message}</p>
      <button className={`p-1 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} rounded hover:opacity-80`} onClick={onHide}>✕</button>
    </div>
  );
};

const InputField: React.FC<{ value: string; label?: string; onChange: (v: string) => void; className?: string; textarea?: boolean }> = ({ value, label, onChange, className = '', textarea }) => {
  const base = "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#7c1386] text-gray-800 bg-white";
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-bold text-[#7c1386] uppercase tracking-wider">{label}</label>}
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} className={`${base} h-24 resize-y`} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className={base} />
      )}
    </div>
  );
};

const DayCard: React.FC<{ day: Day; isEditing: boolean; lang: Language; onUpdate: (d: Day) => void; onDelete: () => void }> = ({ day, isEditing, lang, onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang];

  const updateItem = (idx: number, field: 'time' | 'text', val: string) => {
    const newItems = [...day.items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    onUpdate({ ...day, items: newItems });
  };

  const addItem = () => onUpdate({ ...day, items: [...day.items, { time: '', text: '' }] });
  const removeItem = (idx: number) => onUpdate({ ...day, items: day.items.filter((_, i) => i !== idx) });
  const removeMap = (idx: number) => onUpdate({ ...day, maps: (day.maps || []).filter((_, i) => i !== idx) });

  return (
    <div className="day-card fade-in relative">
      {isEditing && <button onClick={onDelete} className="absolute top-4 right-12 text-red-500 hover:text-red-700 p-2"><TrashIcon /></button>}
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {isEditing ? (
          <div className="flex flex-1 gap-4 mr-10" onClick={e => e.stopPropagation()}>
            <InputField className="w-20" label="Num" value={day.number.toString()} onChange={v => onUpdate({ ...day, number: parseInt(v) || 0 })} />
            <InputField className="flex-1" label="Title" value={day.title} onChange={v => onUpdate({ ...day, title: v })} />
          </div>
        ) : (
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            <span className="day-title-color">{t.dayLabel} {day.number}:</span> {day.title}
          </h3>
        )}
        <svg className={`w-6 h-6 text-gray-600 toggle-icon ${isOpen ? 'rotated' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div className={`day-content mt-4 ${!isOpen && !isEditing ? 'hidden' : ''}`}>
        {isEditing ? (
          <div className="space-y-4">
            <InputField label={t.dateLabel} value={day.date} onChange={v => onUpdate({ ...day, date: v })} />
            <div className="space-y-2 pl-4 border-l-2 border-gray-200">
              <label className="text-sm font-bold text-gray-500 uppercase">{t.detailedItinerary}</label>
              {day.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <InputField className="w-24" label="Time" value={item.time} onChange={v => updateItem(i, 'time', v)} />
                  <InputField className="flex-1" label="Text" value={item.text} onChange={v => updateItem(i, 'text', v)} />
                  <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 pb-2">✕</button>
                </div>
              ))}
              <button onClick={addItem} className="text-blue-500 hover:underline text-sm flex items-center"><PlusIcon />{t.addItem}</button>
            </div>
            <div className="w-full">
               <InputField label={t.inclLabel} value={day.includes || ''} onChange={v => onUpdate({ ...day, includes: v })} />
            </div>
            {day.maps && day.maps.length > 0 && (
               <div className="mt-4 space-y-4">
                  <label className="text-sm font-bold text-gray-500 uppercase">Mapas / Routes</label>
                  {day.maps.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-2 rounded border border-gray-200">
                       <span className="flex-1 text-sm font-medium text-gray-900">{m.origin} → {m.destination}</span>
                       <button onClick={() => removeMap(idx)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-bold uppercase">
                          <TrashIcon /> {t.removeMap}
                       </button>
                    </div>
                  ))}
               </div>
            )}
          </div>
        ) : (
          <>
            {day.date && <p className="text-gray-600 text-lg mb-3"><strong>{day.date}</strong></p>}
            <ul className="list-disc list-inside text-gray-700 info-list">
              {day.items.map((item, index) => (
                <li key={index}>{item.time ? <strong>{item.time}</strong> : ''}{item.time ? ' - ' : ''}{item.text}</li>
              ))}
              {day.includes && <li>{t.inclLabel}: {day.includes}</li>}
            </ul>
            {day.maps && day.maps.length > 0 && (
               <div className="mt-6 space-y-6">
                  {day.maps.map((m, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-100">
                      <iframe
                        width="100%"
                        height="500"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?saddr=${encodeURIComponent(m.origin)}&daddr=${encodeURIComponent(m.destination)}&output=embed`}
                      ></iframe>
                    </div>
                  ))}
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const HotelCard: React.FC<{ hotel: Hotel; isEditing: boolean; lang: Language; onUpdate: (h: Hotel) => void; onDelete: () => void }> = ({ hotel, isEditing, lang, onUpdate, onDelete }) => {
  const t = translations[lang];

  const updateStay = (idx: number, field: keyof HotelStay, val: string) => {
    const newStays = [...hotel.stays];
    newStays[idx] = { ...newStays[idx], [field]: val };
    onUpdate({ ...hotel, stays: newStays });
  };

  const addStay = () => onUpdate({ ...hotel, stays: [...hotel.stays, {}] });
  const removeStay = (idx: number) => onUpdate({ ...hotel, stays: hotel.stays.filter((_, i) => i !== idx) });

  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg mb-6 text-gray-800 relative ${isEditing ? 'border-2 border-dashed border-gray-300' : ''}`}>
      {isEditing && <button onClick={onDelete} className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2"><TrashIcon /></button>}
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Name" value={hotel.name || ''} onChange={v => onUpdate({ ...hotel, name: v })} />
            <InputField label="Stars" value={hotel.stars || ''} onChange={v => onUpdate({ ...hotel, stars: v })} />
          </div>
          <InputField label={t.addrLabel} value={hotel.address || ''} onChange={v => onUpdate({ ...hotel, address: v })} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label={t.phoneLabel} value={hotel.phone || ''} onChange={v => onUpdate({ ...hotel, phone: v })} />
            <InputField label={t.emailLabel} value={hotel.email || ''} onChange={v => onUpdate({ ...hotel, email: v })} />
          </div>
          <InputField label={t.accLabel} value={hotel.room_type || ''} onChange={v => onUpdate({ ...hotel, room_type: v })} />
          
          <div className="mt-4 border-t pt-4">
            <label className="text-sm font-bold text-gray-500 uppercase mb-2 block">Stays</label>
            {hotel.stays.map((s, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded mb-2 border border-gray-200">
                <div className="grid grid-cols-3 gap-2">
                  <InputField label={t.checkIn} value={s.checkIn || ''} onChange={v => updateStay(i, 'checkIn', v)} />
                  <InputField label={t.checkOut} value={s.checkOut || ''} onChange={v => updateStay(i, 'checkOut', v)} />
                  <InputField label={t.nights} value={s.nights || ''} onChange={v => updateStay(i, 'nights', v)} />
                </div>
                {hotel.stays.length > 1 && (
                  <button onClick={() => removeStay(i)} className="text-red-500 text-xs mt-2 uppercase font-bold">Remove Stay</button>
                )}
              </div>
            ))}
            <button onClick={addStay} className="text-blue-500 text-sm flex items-center mt-2"><PlusIcon /> {t.addStay}</button>
          </div>
          <InputField label={t.services} value={hotel.services || ''} onChange={v => onUpdate({ ...hotel, services: v })} />
        </div>
      ) : (
        <>
          <h3 className="text-xl font-bold text-gray-900 mb-4">{hotel.name}{hotel.stars ? ` - ${hotel.stars}` : ''}</h3>
          <div className="space-y-1.5 text-gray-700 leading-relaxed">
            {hotel.address && <p><strong>{t.addrLabel}:</strong> {hotel.address}</p>}
            {hotel.phone && <p><strong>{t.phoneLabel}:</strong> {hotel.phone}</p>}
            {hotel.email && <p><strong>{t.emailLabel}:</strong> {hotel.email}</p>}
            {hotel.room_type && <p><strong>{t.accLabel}:</strong> {hotel.room_type}</p>}
            {hotel.stays.length > 0 && hotel.stays.map((s, i) => (
              <React.Fragment key={i}>
                {s.checkIn && <p><strong>{t.checkIn}:</strong> {s.checkIn}</p>}
                {s.checkOut && <p><strong>{t.checkOut}:</strong> {s.checkOut}</p>}
                {s.nights && <p><strong>{t.nights}:</strong> {s.nights}</p>}
              </React.Fragment>
            ))}
            {hotel.services && <p><strong>{t.services}:</strong> {hotel.services}</p>}
          </div>
        </>
      )}
    </div>
  );
};

const SectionWrapper: React.FC<{ title: string; children: React.ReactNode; isEditing?: boolean }> = ({ title, children }) => (
  <section className="mb-10 p-8 bg-[#401F85] rounded-xl shadow-2xl text-white fade-in">
    <div className="bg-[#7c1386] rounded-xl px-6 py-4 mb-8 shadow-lg">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </section>
);

const ListSection: React.FC<{ title: string; items: string[]; isEditing: boolean; onUpdate: (items: string[]) => void }> = ({ title, items, isEditing, onUpdate }) => {
  const addItem = () => onUpdate([...items, 'New Entry']);
  const removeItem = (idx: number) => onUpdate(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, val: string) => {
    const newItems = [...items];
    newItems[idx] = val;
    onUpdate(newItems);
  };

  return (
    <SectionWrapper title={title}>
      {isEditing ? (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <InputField className="flex-1" value={item} onChange={v => updateItem(i, v)} />
              <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-2 transition-colors"><TrashIcon /></button>
            </div>
          ))}
          <button onClick={addItem} className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all mt-4">
            <PlusIcon /> Add Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <p key={i} className="text-lg font-medium leading-relaxed">{item}</p>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};

const App: React.FC = () => {
  const [itineraryModel, setItineraryModel] = useState<ItineraryModel>(initialItineraryState);
  const [inputText, setInputText] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  // Route Creator State
  const [mapDayIndex, setMapDayIndex] = useState<number>(0);
  const [mapOrigin, setMapOrigin] = useState('');
  const [mapDest, setMapDest] = useState('');

  // Portal Manager State
  const [portalCountry, setPortalCountry] = useState('');
  const [portalUrl, setPortalUrl] = useState('');

  const t = translations[lang];

  useEffect(() => {
    const fadeInEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    fadeInEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [itineraryModel, isEditing]);

  const handleUpdateItinerary = useCallback(() => {
    if (!inputText) {
      setMessage({ text: t.errorUpdate, type: 'error' });
      return;
    }
    try {
      const model = buildItineraryModel(inputText);
      setItineraryModel(prev => ({ ...model, portalLinks: prev.portalLinks }));
      setMessage({ text: t.successUpdate, type: 'success' });
    } catch (err) {
      console.error('[GLOBAL] Error:', err);
      setMessage({ text: err instanceof Error ? err.message : 'Error processing text.', type: 'error' });
    }
  }, [inputText, lang, t.errorUpdate, t.successUpdate]);

  const syncTextFromModel = (model: ItineraryModel) => {
    const updatedText = stringifyItinerary(model, lang);
    setInputText(updatedText);
  };

  const toggleEditMode = () => {
    if (isEditing) {
      syncTextFromModel(itineraryModel);
    }
    setIsEditing(!isEditing);
  };

  const addRouteMap = () => {
    if (!mapOrigin || !mapDest) return;
    const newDays = [...itineraryModel.days];
    const day = newDays[mapDayIndex];
    if (!day) return;
    if (!day.maps) day.maps = [];
    day.maps.push({ origin: mapOrigin, destination: mapDest });
    const newModel = { ...itineraryModel, days: newDays };
    setItineraryModel(newModel);
    syncTextFromModel(newModel);
    setMapOrigin('');
    setMapDest('');
  };

  const addPortalLink = () => {
    if (!portalCountry || !portalUrl) return;
    const newLinks = [...(itineraryModel.portalLinks || []), { country: portalCountry, url: portalUrl }];
    setItineraryModel(prev => ({ ...prev, portalLinks: newLinks }));
    setPortalCountry('');
    setPortalUrl('');
  };

  const removePortalLink = (idx: number) => {
    const newLinks = (itineraryModel.portalLinks || []).filter((_, i) => i !== idx);
    setItineraryModel(prev => ({ ...prev, portalLinks: newLinks }));
  };

  const handleExportPortal = () => {
    if (!itineraryModel.portalLinks?.length) return;

    const cardsHtml = itineraryModel.portalLinks.map(link => `
      <div class="card" onclick="openItinerary('${link.url}', '${link.country}')">
        <img src="${getFlagUrl(link.country)}" alt="${link.country}">
        <h3>TRAVEL BOOK: ${link.country.toUpperCase()}</h3>
        <button>${t.viewItineraryFor} ${link.country}</button>
      </div>
    `).join('');

    const flagsInBar = itineraryModel.portalLinks.map(link => `
      <a href="javascript:void(0)" onclick="openItinerary('${link.url}', '${link.country}')" style="transition: transform 0.2s;">
        <img src="${getFlagUrl(link.country)}" alt="${link.country}" style="height: 32px; width: auto; border-radius: 4px; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
      </a>
    `).join('');

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Travel Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #401F85; font-family: sans-serif; margin: 0; color: white; overflow-x: hidden; }
    #selection-view { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
    #viewer-view { display: none; height: 100vh; flex-direction: column; }
    .container { max-width: 1200px; width: 100%; text-align: center; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .card { background: #7c1386; border-radius: 1.5rem; padding: 2.5rem; cursor: pointer; transition: transform 0.3s; display: flex; flex-direction: column; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .card:hover { transform: translateY(-10px); background: #8e1a99; }
    .card img { width: 80px; height: auto; border-radius: 8px; margin-bottom: 1.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    .card h3 { font-size: 1.25rem; font-weight: 800; margin-bottom: 1.5rem; }
    .card button { background: #f39c12; border: none; padding: 0.75rem 1.5rem; border-radius: 2rem; color: white; font-weight: bold; width: 100%; transition: background 0.2s; }
    .card:hover button { background: #e67e22; }
    h1 { font-size: 48px !important; font-weight: 900; line-height: 1.1; margin-bottom: 1rem; text-shadow: 0 4px 12px rgba(0,0,0,0.4); text-transform: uppercase; }
    p.subtitle { opacity: 0.9; font-size: 24px; font-weight: 400; }
    .top-nav-bar { height: 72px; background-color: #7c1386; display: flex; align-items: center; padding: 0 32px; gap: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); flex-shrink: 0; }
    .back-btn { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); color: white; font-weight: 800; padding: 10px 24px; border-radius: 8px; cursor: pointer; text-transform: uppercase; font-size: 14px; letter-spacing: 0.1em; transition: background 0.2s; }
    #itinerary-frame { flex-grow: 1; border: none; width: 100%; background: white; }
  </style>
</head>
<body>
  <div id="selection-view">
    <div class="container">
      <h1>${t.welcomePortal}</h1>
      <p class="subtitle">${t.selectCountry}</p>
      <div class="grid">${cardsHtml}</div>
    </div>
  </div>
  <div id="viewer-view">
    <div class="top-nav-bar">
      <button class="back-btn" onclick="closeItinerary()">${t.back}</button>
      <div style="display: flex; gap: 20px; align-items: center;">
        ${flagsInBar}
      </div>
    </div>
    <iframe id="itinerary-frame" src=""></iframe>
  </div>
  <script>
    function openItinerary(url, country) {
      document.getElementById('selection-view').style.display = 'none';
      document.getElementById('viewer-view').style.display = 'flex';
      document.getElementById('itinerary-frame').src = url;
    }
    function closeItinerary() {
      document.getElementById('viewer-view').style.display = 'none';
      document.getElementById('selection-view').style.display = 'flex';
      document.getElementById('itinerary-frame').src = '';
    }
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'portal.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

const handleExportHtml = useCallback(async () => {
  const contentEl = document.getElementById('content');
  if (!contentEl) return;

  // ── 1. Clonar el contenido ────────────────────────────────────────────────
  const contentClone = contentEl.cloneNode(true) as HTMLElement;

  // Colapsar días en el export interactivo
  contentClone.querySelectorAll('.day-content').forEach(el => el.classList.add('hidden'));
  contentClone.querySelectorAll('.toggle-icon').forEach(el => el.classList.remove('rotated'));

  // Limpiar controles de editor
  contentClone.querySelector('#controls-section')?.remove();
  contentClone.querySelector('#editor-section')?.remove();
  contentClone.querySelector('#update-itinerary')?.remove();

  // ── 2. Embeber logo a base64 usando Image + Canvas (evita CORS) ───────────
  // En lugar de fetch (bloqueado por CORS), cargamos la imagen con un <img>
  // nativo con crossOrigin="anonymous" y la dibujamos en canvas.
  // Si sigue fallando CORS, usamos un proxy de imagen público como fallback.
  async function embedImageToBase64(imgEl: HTMLImageElement): Promise<void> {
    const src = imgEl.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return;

    const absUrl = src.startsWith('http') ? src : new URL(src, window.location.href).href;

    // Intento 1: canvas directo con crossOrigin anonymous
    const success = await new Promise<boolean>((resolve) => {
      const tmp = new Image();
      tmp.crossOrigin = 'anonymous';
      tmp.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = tmp.naturalWidth || 400;
          canvas.height = tmp.naturalHeight || 200;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(false); return; }
          ctx.drawImage(tmp, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          imgEl.setAttribute('src', dataUrl);
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      tmp.onerror = () => resolve(false);
      tmp.src = absUrl;
    });

    if (success) return;

    // Intento 2: proxy público (allorigins) para sortear CORS
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(absUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('proxy failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      await new Promise<void>((resolve) => {
        const tmp = new Image();
        tmp.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = tmp.naturalWidth || 400;
          canvas.height = tmp.naturalHeight || 200;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(tmp, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          imgEl.setAttribute('src', dataUrl);
          URL.revokeObjectURL(blobUrl);
          resolve();
        };
        tmp.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(); };
        tmp.src = blobUrl;
      });
    } catch (e) {
      console.warn('Could not embed image via proxy either:', absUrl);
      // Dejamos el src original como último recurso
    }
  }

  const cloneImgs = Array.from(contentClone.querySelectorAll('img')) as HTMLImageElement[];
  for (const img of cloneImgs) {
    await embedImageToBase64(img);
  }

  // ── 3. Head limpio ────────────────────────────────────────────────────────
  const headClone = document.head.cloneNode(true) as HTMLHeadElement;
  headClone.querySelectorAll('script[type="importmap"]').forEach(el => el.remove());
  headClone.querySelectorAll('script').forEach(script => {
    const src = (script as HTMLScriptElement).src || '';
    if (!src.includes('cdn.tailwindcss.com')) script.remove();
  });

  // ── 4. CSS extra ──────────────────────────────────────────────────────────
  const extraCss = `
    body {
      margin: 0;
      background: #f3f4f6;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }

    /* Evitar cortes dentro de secciones y tarjetas */
    section,
    .day-card,
    .bg-white.p-6.rounded-lg,
    .bg-white.p-6.rounded-xl {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    h1, h2, h3, h4 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    /* Clase temporal solo para PDF: fuerza grilla de pasajeros a 1 columna */
    .passenger-grid-pdf {
      grid-template-columns: 1fr !important;
    }

    /* Botón flotante PDF */
    #export-download-pdf-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      color: #fff;
      background: #7c1386;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,.2), 0 4px 6px -2px rgba(0,0,0,.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform .2s ease, background-color .2s ease;
      z-index: 9999;
    }
    #export-download-pdf-btn:hover { transform: scale(1.08); background: #65106d; }
    #export-download-pdf-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
    #export-download-pdf-btn .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

    @media print {
      #export-download-pdf-btn { display: none !important; }
    }
  `;

  // ── 5. Script interactivo + PDF ───────────────────────────────────────────
  const html2pdfCdn = `https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js`;

  const interactivityJs = `
  const downloadIconSvg = \`<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>\`;
  const spinnerSvg = \`<svg class="spin" width="26" height="26" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>\`;

  function wireDayToggles() {
    document.querySelectorAll('.day-card .cursor-pointer').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling;
        const icon = toggle.querySelector('.toggle-icon');
        if (content && content.classList.contains('day-content')) content.classList.toggle('hidden');
        if (icon) icon.classList.toggle('rotated');
      });
    });
  }

  async function waitForHtml2Pdf() {
    for (let i = 0; i < 60; i++) {
      if (typeof window.html2pdf !== 'undefined') return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return false;
  }

  async function downloadPdf() {
    const btn = document.getElementById('export-download-pdf-btn');
    const sourceElement = document.getElementById('content');
    if (!btn || !sourceElement) { alert('Could not find content to export.'); return; }

    btn.disabled = true;
    btn.innerHTML = spinnerSvg;

    const ok = await waitForHtml2Pdf();
    if (!ok) {
      btn.disabled = false;
      btn.innerHTML = downloadIconSvg;
      alert('html2pdf not ready. Try again.');
      return;
    }

    // Expand all days for PDF
    const dayContents = Array.from(sourceElement.querySelectorAll('.day-content'));
    const icons = Array.from(sourceElement.querySelectorAll('.toggle-icon'));
    const wasHidden = dayContents.map(el => el.classList.contains('hidden'));
    dayContents.forEach(el => el.classList.remove('hidden'));
    icons.forEach(el => el.classList.add('rotated'));

    // ── FIX PASAJEROS: solo la grilla DIRECTA de pasajeros (dentro de la sección "who is traveling")
    // Identificamos la sección por su texto de título para NO afectar otras grillas
    const passengerSection = Array.from(sourceElement.querySelectorAll('section')).find(s =>
      s.querySelector('h2')?.textContent?.toLowerCase().includes('travel') ||
      s.querySelector('h2')?.textContent?.toLowerCase().includes('viaj')
    );
    const passengerGrid = passengerSection?.querySelector('.grid');
    if (passengerGrid) passengerGrid.classList.add('passenger-grid-pdf');

    btn.style.display = 'none';

    const opt = {
      margin: 0.35,
      filename: 'Travel_Book.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollY: 0,
        windowWidth: document.documentElement.scrollWidth,
        imageTimeout: 15000,
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        avoid: ['section', '.day-card', '.bg-white.p-6.rounded-lg', '.bg-white.p-6.rounded-xl']
      }
    };

    try {
      await window.html2pdf().set(opt).from(sourceElement).save();
    } catch (e) {
      console.error(e);
      alert('PDF generation failed. Check console (F12).');
    } finally {
      dayContents.forEach((el, idx) => { if (wasHidden[idx]) el.classList.add('hidden'); });
      icons.forEach(el => el.classList.remove('rotated'));
      if (passengerGrid) passengerGrid.classList.remove('passenger-grid-pdf');

      btn.style.display = 'flex';
      btn.disabled = false;
      btn.innerHTML = downloadIconSvg;
    }
  }

  function init() {
    wireDayToggles();
    const pdfBtn = document.getElementById('export-download-pdf-btn');
    if (!pdfBtn) return;
    pdfBtn.innerHTML = downloadIconSvg;
    pdfBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await downloadPdf();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  `;

  // ── 6. HTML final ─────────────────────────────────────────────────────────
  const headHtml = headClone.innerHTML + `<style>${extraCss}</style>`;

  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  ${headHtml}
</head>
<body class="bg-gray-100 p-4 sm:p-6 lg:p-8">
  ${contentClone.outerHTML}
  <button id="export-download-pdf-btn" aria-label="Download PDF"></button>
  <script src="${html2pdfCdn}"></script>
  <script>${interactivityJs}</script>
</body>
</html>`.trim();

  // ── 7. Descargar ──────────────────────────────────────────────────────────
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Travel_Itinerary_with_PDF.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}, []);

  return (
    <>
      {message && <MessageBox message={message.text} type={message.type} onHide={() => setMessage(null)} />}
      
      <button id="fab-edit" onClick={toggleEditMode} className={`fixed bottom-10 right-10 z-[100] p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center gap-2 ${isEditing ? 'bg-green-600' : 'bg-[#7c1386] animate-pulse'} text-white group print:hidden`}>
        {isEditing ? <CheckIcon /> : <EditIcon />}
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">{isEditing ? t.saveText : t.editText}</span>
      </button>

      <div id="content" className={`max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 my-8 pt-10`}>
        <header className="text-center mb-8 break-inside-avoid relative">
          <div className="flex justify-center mb-6"><img src="https://gaston.toogo.in/public/a87f/group-files/a35cae1a/color_logo_transparent%20PNG.png" alt="Logo" className="h-36" /></div>
          <hr className="border-t-[3.5px] border-[#7c1386]" />
          <div className="mt-6 flex flex-col items-center">
            {isEditing ? (
              <><InputField className="w-full max-w-lg mb-2" value={itineraryModel.mainHeader.title || ''} onChange={v => setItineraryModel(prev => ({...prev, mainHeader: {...prev.mainHeader, title: v}}))} /><InputField className="w-full max-w-lg" value={itineraryModel.mainHeader.subtitle || ''} onChange={v => setItineraryModel(prev => ({...prev, mainHeader: {...prev.mainHeader, subtitle: v}}))} /></>
            ) : (
              <><h1 className="text-4xl font-bold text-gray-800">{itineraryModel.mainHeader.title}</h1><p className="text-xl text-gray-600 mt-2">{itineraryModel.mainHeader.subtitle}</p></>
            )}
          </div>
        </header>

        <section className={`agency-info-banner fade-in ${isEditing ? 'border-2 border-yellow-400' : ''}`}>
          {isEditing ? <div className="w-full max-w-xl mx-auto"><InputField label={t.agency} value={itineraryModel.mainHeader.agency || ''} onChange={v => setItineraryModel(prev => ({...prev, mainHeader: {...prev.mainHeader, agency: v}}))} /></div> : <p className="text-xl font-semibold">{t.agency}: {itineraryModel.mainHeader.agency}</p>}
        </section>

        <section className="mb-10 p-8 bg-[#401F85] rounded-xl shadow-inner text-white">
          <h2 className="text-3xl font-bold mb-6 section-header">{t.whoTraveling}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {itineraryModel.passengers.map((p, i) => (
              <div key={i} className={`bg-white p-6 rounded-lg shadow-md relative text-gray-800`}>
                {isEditing && <button onClick={() => setItineraryModel(prev => ({...prev, passengers: prev.passengers.filter((_, idx) => idx !== i)}))} className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2"><TrashIcon /></button>}
                <p className="text-xl font-bold mb-4 text-[#401F85] uppercase tracking-tight">{p.name || ''}</p>
                {isEditing ? (
                  <div className="space-y-4">
                    <InputField label="Name" value={p.name || ''} onChange={v => {
                      const newP = [...itineraryModel.passengers];
                      newP[i] = { ...newP[i], name: v };
                      setItineraryModel(prev => ({ ...prev, passengers: newP }));
                    }} />
                    <div className="grid grid-cols-2 gap-3">
                       <InputField label={t.nationality} value={p.nationality || ''} onChange={v => {
                          const newP = [...itineraryModel.passengers];
                          newP[i] = { ...newP[i], nationality: v };
                          setItineraryModel(prev => ({ ...prev, passengers: newP }));
                       }} />
                       <InputField label={t.passport} value={p.passport || ''} onChange={v => {
                          const newP = [...itineraryModel.passengers];
                          newP[i] = { ...newP[i], passport: v };
                          setItineraryModel(prev => ({ ...prev, passengers: newP }));
                       }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <InputField label={t.dob} value={p.date_of_birth || ''} onChange={v => {
                          const newP = [...itineraryModel.passengers];
                          newP[i] = { ...newP[i], date_of_birth: v };
                          setItineraryModel(prev => ({ ...prev, passengers: newP }));
                       }} />
                       <InputField label={t.room} value={p.room || ''} onChange={v => {
                          const newP = [...itineraryModel.passengers];
                          newP[i] = { ...newP[i], room: v };
                          setItineraryModel(prev => ({ ...prev, passengers: newP }));
                       }} />
                    </div>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-gray-700 info-list space-y-1">
                    {p.nationality && <li><strong>{t.nationality}:</strong> {p.nationality}</li>}
                    {p.passport && <li><strong>{t.passport}:</strong> {p.passport}</li>}
                    {p.date_of_birth && <li><strong>{t.dob}:</strong> {p.date_of_birth}</li>}
                    {p.room && <li><strong>{t.room}:</strong> {p.room}</li>}
                  </ul>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <button 
              onClick={() => setItineraryModel(prev => ({...prev, passengers: [...prev.passengers, { name: 'New Passenger' }]}))} 
              className="mt-8 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg flex items-center shadow-lg mx-auto transition-all"
            >
              <PlusIcon /> {t.addPassenger}
            </button>
          )}
        </section>

        <section className="mb-10 p-8 bg-[#401F85] rounded-xl shadow-inner text-white">
          <h2 className="text-3xl font-bold mb-6 section-header">{t.tripSummary}</h2>
          {isEditing ? <InputField textarea value={itineraryModel.overview} onChange={v => setItineraryModel(prev => ({ ...prev, overview: v }))} /> : <p className="text-white leading-relaxed text-lg fade-in">{itineraryModel.overview}</p>}
        </section>

        <section className="mb-10" id="detailedItinerarySection">
          <h2 className="text-3xl font-bold mb-6 section-header">{t.detailedItinerary}</h2>
          {itineraryModel.days.map((day, idx) => <DayCard key={idx} day={day} isEditing={isEditing} lang={lang} onUpdate={nd => {
            const newDays = [...itineraryModel.days];
            newDays[idx] = nd;
            setItineraryModel(prev => ({ ...prev, days: newDays }));
          }} onDelete={() => {
            const newDays = itineraryModel.days.filter((_, i) => i !== idx);
            setItineraryModel(prev => ({ ...prev, days: newDays }));
          }} />)}
          {isEditing && <button onClick={() => {
            const nextNum = (itineraryModel.days.length > 0 ? Math.max(...itineraryModel.days.map(d => d.number)) : 0) + 1;
            setItineraryModel(prev => ({ ...prev, days: [...prev.days, { number: nextNum, title: 'New Destination', date: '', items: [], maps: [] }] }));
          }} className="mt-4 bg-[#7c1386] hover:opacity-90 text-white px-6 py-3 rounded-lg flex items-center shadow-lg mx-auto"><PlusIcon /> {t.addDay}</button>}
        </section>

        {/* HOTEL INFORMATION SECTION (Updated Design) */}
        <SectionWrapper title={t.hotelInfo}>
          {itineraryModel.hotels.map((hotel, idx) => (
            <HotelCard 
              key={idx} 
              hotel={hotel} 
              isEditing={isEditing} 
              lang={lang} 
              onUpdate={nh => {
                const newHotels = [...itineraryModel.hotels];
                newHotels[idx] = nh;
                setItineraryModel(prev => ({ ...prev, hotels: newHotels }));
              }} 
              onDelete={() => {
                const newHotels = itineraryModel.hotels.filter((_, i) => i !== idx);
                setItineraryModel(prev => ({ ...prev, hotels: newHotels }));
              }} 
            />
          ))}
          {isEditing && (
            <button 
              onClick={() => setItineraryModel(prev => ({ ...prev, hotels: [...prev.hotels, { name: 'New Hotel', stays: [] }] }))} 
              className="mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-lg mx-auto"
            >
              <PlusIcon /> {t.addHotel}
            </button>
          )}
        </SectionWrapper>

        {/* PRACTICAL INFORMATION SECTION (Updated Design) */}
        <ListSection 
          title={t.practicalInfo} 
          items={itineraryModel.practicalInfo} 
          isEditing={isEditing} 
          onUpdate={items => setItineraryModel(prev => ({ ...prev, practicalInfo: items }))} 
        />

        {/* EMERGENCY CONTACTS SECTION (Updated Design) */}
        <ListSection 
          title={t.emergencyContacts} 
          items={itineraryModel.emergency} 
          isEditing={isEditing} 
          onUpdate={items => setItineraryModel(prev => ({ ...prev, emergency: items }))} 
        />

        <div id="controls-section" className="print:hidden">
            <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-gray-200 pt-8">
              <button onClick={handleExportHtml} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">{t.exportHtml}</button>
              <button onClick={() => {
                const text = stringifyItinerary(itineraryModel, lang);
                const blob = new Blob([text], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `Itinerary_${itineraryModel.mainHeader.subtitle || 'Export'}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">{t.exportText}</button>
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-md transition-all ${lang === 'en' ? 'bg-white shadow text-[#7c1386] font-bold' : 'text-gray-600'}`}>EN</button>
                <button onClick={() => setLang('es')} className={`px-4 py-2 rounded-md transition-all ${lang === 'es' ? 'bg-white shadow text-[#7c1386] font-bold' : 'text-gray-600'}`}>ES</button>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-inner">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t.updateButton}</h3>
                <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full p-4 border border-gray-300 rounded-lg mb-4 h-64 resize-y focus:outline-none focus:ring-2 focus:ring-[#7c1386]" placeholder={t.placeholder}></textarea>
                <button onClick={handleUpdateItinerary} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">{t.updateButton}</button>
            </div>

            {/* Route Map Creator Section */}
            {itineraryModel.days.length > 0 && (
              <div className="mt-8 p-6 bg-[#7c1386] rounded-xl shadow-lg text-white">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><MapIcon /> {t.routeCreator}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider">{t.selectDay}</label>
                    <select value={mapDayIndex} onChange={(e) => setMapDayIndex(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-yellow-400">
                      {itineraryModel.days.map((d, i) => <option key={i} value={i}>{t.dayLabel} {d.number}: {d.title}</option>)}
                    </select>
                  </div>
                  <InputField label={t.origin} value={mapOrigin} onChange={setMapOrigin} />
                  <InputField label={t.destination} value={mapDest} onChange={setMapDest} />
                  <button onClick={addRouteMap} className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-2 px-6 rounded shadow-lg transition-all flex items-center justify-center">
                    <PlusIcon /> {t.addMap}
                  </button>
                </div>
              </div>
            )}

            {/* Portal Manager Section */}
            <div className="mt-8 p-6 bg-[#401F85] rounded-xl shadow-lg text-white">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><LinkIcon /> {t.portalManager}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-8">
                  <InputField label={t.countryName} value={portalCountry} onChange={setPortalCountry} />
                  <InputField label={t.urlLabel} value={portalUrl} onChange={setPortalUrl} />
                  <div className="flex gap-2">
                    <button onClick={addPortalLink} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow transition-all flex items-center justify-center">
                      <PlusIcon /> {t.addPortalLink}
                    </button>
                    <button onClick={handleExportPortal} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-2 px-4 rounded shadow transition-all flex items-center justify-center">
                      {t.exportPortal}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {itineraryModel.portalLinks?.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <img src={getFlagUrl(link.country)} alt={link.country} className="h-8 w-auto rounded shadow" />
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-lg">{link.country.toUpperCase()}</p>
                        <p className="text-xs opacity-60 truncate">{link.url}</p>
                      </div>
                      <button 
                        onClick={() => removePortalLink(idx)}
                        className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default App;
