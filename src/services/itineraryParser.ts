import type { ItineraryModel, ItinerarySections, Passenger, Day, Hotel, RouteMap } from '../types';

const HEADER_MAP: { [key: string]: string } = {
  '--- MAIN HEADER ---': 'MAIN_HEADER',
  '--- ENCABEZADO PRINCIPAL ---': 'MAIN_HEADER',
  '--- SECTION: Who is Traveling? ---': 'WHO_TRAVELING',
  '--- SECCIÓN: ¿Quién Viaja? ---': 'WHO_TRAVELING',
  '--- SECTION: Trip Overview ---': 'TRIP_OVERVIEW',
  '--- SECCIÓN: Resumen del Viaje ---': 'TRIP_OVERVIEW',
  '--- SECTION: Detailed Itinerary ---': 'DETAILED_ITINERARY',
  '--- SECCIÓN: Itinerario Detallado ---': 'DETAILED_ITINERARY',
  '--- SECTION: Hotel Information ---': 'HOTEL_INFO',
  '--- SECCIÓN: Información sobre los Hoteles ---': 'HOTEL_INFO',
  '--- SECTION: Essential Practical Information ---': 'PRACTICAL_INFO',
  '--- SECCIÓN: Información Práctica Esencial ---': 'PRACTICAL_INFO',
  '--- SECTION: Emergency and Coordination Contacts ---': 'EMERGENCY_CONTACTS',
  '--- SECCIÓN: Contactos de Emergencia y Coordinación ---': 'EMERGENCY_CONTACTS',
};

export function stringifyItinerary(model: ItineraryModel, lang: 'en' | 'es' = 'en'): string {
  let output = '';
  const isEs = lang === 'es';

  // Main Header
  output += isEs ? '--- ENCABEZADO PRINCIPAL ---\n' : '--- MAIN HEADER ---\n';
  const headerLabels: Record<string, string> = isEs ? {
    title: 'Titulo',
    subtitle: 'Subtitulo',
    agency: 'Agencia',
    nationality: 'Nacionalidad',
    agency_contact: 'Contacto de la Agencia',
  } : {
    title: 'Title',
    subtitle: 'Subtitle',
    agency: 'Agency',
    nationality: 'Nationality',
    agency_contact: 'Agency Contact',
  };

  Object.entries(model.mainHeader).forEach(([key, val]) => {
    if (key === 'contact' && model.mainHeader.agency_contact) return;
    const label = headerLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    output += `${isEs ? '' : '- '}${label}: ${val || ''}\n`;
  });
  output += '\n';

  // Who is Traveling
  output += isEs ? '--- SECCIÓN: ¿Quién Viaja? ---\n' : '--- SECTION: Who is Traveling? ---\n';
  model.passengers.forEach(p => {
    output += isEs ? `[Titulo ${p.name || ''}]\n` : `- ${p.name || 'New Passenger'}\n`;
    const pLabels: Record<string, string> = isEs ? {
      nationality: 'Nacionalidad',
      passport: 'Pasaporte',
      date_of_birth: 'Fecha de Nacimiento',
      room: 'Habitación'
    } : {
      nationality: 'Nationality',
      passport: 'Passport',
      date_of_birth: 'Date of Birth',
      room: 'Room'
    };

    if (p.nationality) output += `  ${isEs ? '' : '- '}${pLabels.nationality}: ${p.nationality}\n`;
    if (p.passport) output += `  ${isEs ? '' : '- '}${pLabels.passport}: ${p.passport}\n`;
    if (p.date_of_birth) output += `  ${isEs ? '' : '- '}${pLabels.date_of_birth}: ${p.date_of_birth}\n`;
    if (p.room) output += `  ${isEs ? '' : '- '}${pLabels.room}: ${p.room}\n`;
  });
  output += '\n';

  // Trip Overview
  output += isEs ? '--- SECCIÓN: Resumen del Viaje ---\n' : '--- SECTION: Trip Overview ---\n';
  output += isEs ? `${model.overview}\n\n` : `- ${model.overview}\n\n`;

  // Detailed Itinerary
  output += isEs ? '--- SECCIÓN: Itinerario Detallado ---\n' : '--- SECTION: Detailed Itinerary ---\n';
  model.days.forEach(d => {
    output += isEs ? `DÍA ${d.number}: ${d.title}\n` : `DAY ${d.number}: ${d.title}\n`;
    if (d.date) output += isEs ? `Fecha: ${d.date}\n` : `Date: ${d.date}\n`;
    d.items.forEach(item => {
      output += `- ${item.time ? item.time + ': ' : ''}${item.text}\n`;
    });
    if (d.includes) output += isEs ? `Servicios incluidos: ${d.includes}\n` : `- Includes: ${d.includes}\n`;
    if (d.maps && d.maps.length > 0) {
      d.maps.forEach(m => {
        output += `[MAPA: ${m.origin} - ${m.destination}]\n`;
      });
    }
    output += '\n';
  });

  // Hotels
  output += isEs ? '--- SECCIÓN: Información sobre los Hoteles ---\n' : '--- SECTION: Hotel Information ---\n';
  model.hotels.forEach(h => {
    output += `- HOTEL: ${h.name}${h.stars ? ' - ' + h.stars : ''}\n`;
    const hLabels: Record<string, string> = isEs ? {
      address: 'Dirección',
      phone: 'Teléfono',
      email: 'Email',
      reservation_number: 'Número de Reserva',
      room_type: 'Tipo de Habitación',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      nights: 'Duración de la Estancia',
      services: 'Servicios'
    } : {
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      reservation_number: 'Reservation number',
      room_type: 'Room Type',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      nights: 'Duration of stay',
      services: 'Services'
    };

    if (h.address) output += `- ${hLabels.address}: ${h.address}\n`;
    if (h.phone) output += `- ${hLabels.phone}: ${h.phone}\n`;
    if (h.email) output += `- ${hLabels.email}: ${h.email}\n`;
    if (h.reservation_number) output += `- ${hLabels.reservation_number}: ${h.reservation_number}\n`;
    if (h.room_type) output += `- ${hLabels.room_type}: ${h.room_type}\n`;
    
    h.stays.forEach((s, idx) => {
      const prefix = idx === 0 ? '' : (isEs ? 'Segundo ' : 'Second ');
      if (s.checkIn) output += `- ${prefix}${hLabels.checkIn}: ${s.checkIn}\n`;
      if (s.checkOut) output += `- ${prefix}${hLabels.checkOut}: ${s.checkOut}\n`;
      if (s.nights) output += `- ${hLabels.nights}: ${s.nights}\n`;
    });
    if (h.services) output += `- ${hLabels.services}: ${h.services}\n`;
    output += '\n';
  });

  // Practical
  output += isEs ? '--- SECCIÓN: Información Práctica Esencial ---\n' : '--- SECTION: Essential Practical Information ---\n';
  model.practicalInfo.forEach(info => {
    output += `- ${info}\n`;
  });
  output += '\n';

  // Emergency
  output += isEs ? '--- SECCIÓN: Contactos de Emergencia y Coordinación ---\n' : '--- SECTION: Emergency and Coordination Contacts ---\n';
  model.emergency.forEach(c => {
    output += `- ${c}\n`;
  });

  return output;
}

function parseItinerary(inputText: string): ItinerarySections {
  const sections: ItinerarySections = {};
  let currentSection: string | null = null;
  const lines = (inputText || '').split(/\r?\n/);

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (HEADER_MAP[line]) {
      currentSection = HEADER_MAP[line];
      sections[currentSection] = sections[currentSection] || [];
      return;
    }
    if (!line) return;
    if (typeof currentSection === 'string' && Array.isArray(sections[currentSection])) {
      sections[currentSection].push(rawLine);
    }
  });

  if (Object.keys(sections).length === 0) {
      throw new Error('No sections detected. Missing headers?');
  }
  return sections;
}

function ensureArray<T extends object, K extends keyof T>(obj: T, key: K): void {
  if (!obj[key]) {
    (obj as any)[key] = [];
  } else if (!Array.isArray(obj[key])) {
    (obj as any)[key] = [obj[key]];
  }
}

function normalizeSections(sections: ItinerarySections): ItinerarySections {
  const out: ItinerarySections = {};
  const KEYS = [
    'MAIN_HEADER',
    'WHO_TRAVELING',
    'TRIP_OVERVIEW',
    'DETAILED_ITINERARY',
    'HOTEL_INFO',
    'PRACTICAL_INFO',
    'EMERGENCY_CONTACTS',
  ];
  KEYS.forEach(k => {
    const v = sections[k];
    out[k] = Array.isArray(v) ? v : (v ? [String(v)] : []);
  });
  return out;
}

export function buildItineraryModel(inputText: string): ItineraryModel {
  const sectionsRaw = parseItinerary(inputText);
  const sections = normalizeSections(sectionsRaw);
  const model: ItineraryModel = {
    mainHeader: {},
    passengers: [],
    overview: "",
    days: [],
    hotels: [],
    practicalInfo: [],
    emergency: []
  };

  sections.MAIN_HEADER.forEach(line => {
    const m = line.match(/^\s*-?\s*([^:]+?)\s*:\s*(.*)\s*$/);
    if (!m) return;
    const rawKey = m[1].trim().toLowerCase();
    let key = rawKey.replace(/\s+/g, '_').replace(/^-+/, '');
    if (key === 'titulo') key = 'title';
    if (key === 'subtitulo') key = 'subtitle';
    if (key === 'agencia') key = 'agency';
    if (key === 'nacionalidad') key = 'nationality';
    if (key === 'contacto_de_la_agencia' || key === 'contacto_agencia') key = 'agency_contact';
    const val = m[2].trim();
    model.mainHeader[key] = val;
    if (key === 'agency_contact') model.mainHeader.contact = val;
  });

  let currentPassenger: Passenger | null = null;
  sections.WHO_TRAVELING.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    const detailMatch = trimmedLine.match(/^\s*-?\s*([^:]+?)\s*:\s*(.*)\s*$/);
    if (detailMatch) {
      if (currentPassenger) {
        let key = detailMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
        if (key === 'nacionalidad') key = 'nationality';
        if (key === 'pasaporte') key = 'passport';
        if (key === 'fecha_de_nacimiento') key = 'date_of_birth';
        if (key === 'habitación' || key === 'habitacion') key = 'room';
        currentPassenger[key] = detailMatch[2].trim();
      }
      return;
    }
    const titleMatch = trimmedLine.match(/^\[(?:Titulo|Title)\s+(.+)\]$/i);
    const hyphenMatch = trimmedLine.match(/^\s*-\s*(.+)$/);
    if (titleMatch || hyphenMatch) {
      if (currentPassenger) model.passengers.push(currentPassenger);
      const name = (titleMatch ? titleMatch[1] : hyphenMatch![1]).trim();
      currentPassenger = { name: name.replace(/:$/, '').trim() };
    }
  });
  if (currentPassenger) model.passengers.push(currentPassenger);

  model.overview = sections.TRIP_OVERVIEW
    .map(l => l.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean)
    .join(' ');

  let currentDay: Day | null = null;
  sections.DETAILED_ITINERARY.forEach(line => {
    const dayHdr = line.match(/^(?:DAY|DAY|DÍA|DIA|JOUR)\s*(\d+)\s*:\s*(.*)$/i);
    const dateLine = line.match(/^\s*(?:Date|Fecha)\s*:\s*(.+)$/i);
    const itemTime = line.match(/^\s*-\s*(\d{1,2}:\d{2}|\d{1,2}h\d{2})\s*[:\s]\s*(.+)$/);
    const incl = line.match(/^\s*(?:-\s*)?(?:Included services|Servicios incluidos)\s*:\s*(.+)$/i);
    const mapMatch = line.match(/^\[MAPA:\s*(.+?)\s*-\s*(.+?)\]$/i);

    if (dayHdr) {
      const num = Number(dayHdr[1]);
      currentDay = { number: num, title: dayHdr[2].trim(), date: '', items: [], maps: [] };
      model.days.push(currentDay);
      return;
    }
    if (!currentDay) return;

    if (dateLine) {
      currentDay.date = dateLine[1].trim();
      return;
    }
    if (itemTime) {
      const time = itemTime[1].replace('h', ':');
      currentDay.items.push({ time, text: itemTime[2].trim() });
      return;
    }
    if (incl) {
      currentDay.includes = incl[1].trim();
      return;
    }
    if (mapMatch) {
      if (!currentDay.maps) currentDay.maps = [];
      currentDay.maps.push({ origin: mapMatch[1].trim(), destination: mapMatch[2].trim() });
      return;
    }
    const simpleItem = line.match(/^\s*-\s*(.+)$/);
    if (simpleItem) {
        currentDay.items.push({ time: '', text: simpleItem[1].trim() });
    }
  });

  let currentHotel: Hotel | null = null;
  sections.HOTEL_INFO.forEach(line => {
    const hotelHdr = line.match(/^\s*-\s*H[OÔ]TEL\s*:\s*(.+)$/i);
    if (hotelHdr) {
      if (currentHotel && Object.keys(currentHotel).length) model.hotels.push(currentHotel);
      const parts = hotelHdr[1].trim().split(/\s+-\s+/);
      currentHotel = { name: parts[0].trim(), stars: (parts[1] || '').trim(), stays: [] };
      return;
    }
    if (!currentHotel) return;
    const kv = line.match(/^\s*-\s*([^:]+?)\s*:\s*(.*)\s*$/);
    if (!kv) return;
    let k = kv[1].trim().toLowerCase();
    const v = kv[2].trim();
    if (k === 'dirección' || k === 'direccion') k = 'address';
    if (k === 'teléfono' || k === 'telefono') k = 'phone';
    if (k === 'email' || k === 'correo') k = 'email';
    if (k.includes('reserva')) k = 'reservation_number';
    if (k.includes('habitación') || k.includes('habitacion')) k = 'room_type';
    if (k === 'servicios') k = 'services';

    if (k === 'address') currentHotel.address = v;
    else if (k === 'phone') currentHotel.phone = v;
    else if (k === 'email') currentHotel.email = v;
    else if (k === 'reservation_number') currentHotel.reservation_number = v;
    else if (k === 'room_type') currentHotel.room_type = v;
    else if (k === 'services') currentHotel.services = v;
    else if (k.includes('check in')) {
      ensureArray(currentHotel, 'stays');
      if (!currentHotel.stays.length || currentHotel.stays[currentHotel.stays.length - 1].checkOut) {
        currentHotel.stays.push({ checkIn: v });
      } else currentHotel.stays[currentHotel.stays.length - 1].checkIn = v;
    }
    else if (k.includes('check out')) {
      ensureArray(currentHotel, 'stays');
      if (!currentHotel.stays.length) currentHotel.stays.push({});
      currentHotel.stays[currentHotel.stays.length - 1].checkOut = v;
    }
    else if (k.includes('stay') || k.includes('estancia')) {
      ensureArray(currentHotel, 'stays');
      if (!currentHotel.stays.length) currentHotel.stays.push({});
      currentHotel.stays[currentHotel.stays.length - 1].nights = v;
    }
  });
  if (currentHotel && Object.keys(currentHotel).length > 2 && !model.hotels.includes(currentHotel)) {
    model.hotels.push(currentHotel);
  }

  sections.PRACTICAL_INFO.forEach(l => {
    const t = l.replace(/^\s*-\s*/, '').trim();
    if (t) model.practicalInfo.push(t);
  });
  sections.EMERGENCY_CONTACTS.forEach(l => {
    const t = l.replace(/^\s*-\s*/, '').trim();
    if (t) model.emergency.push(t);
  });
  return model;
}
