/**
 * API INDEPENDIENTE DEL MAPA 5K INJU–MIDES FLORIDA.
 * Este archivo pertenece a MidesFlorida/5k-INJU-MIDES-2026.
 * No comparte el backend del Centro de Prensa.
 *
 * Configuración:
 * - La planilla está definida por MAPA5K_SPREADSHEET_ID.
 * - La pestaña Mapa5K y sus encabezados se crean al llamar mapa5kInicializar.
 * - Configurá la propiedad de script ADMIN_KEY con la misma clave que ingresarás en el editor.
 *
 * Para activar la API: copiar este archivo a un proyecto NUEVO de Apps Script,
 * ejecutar prepararMapa5K(), implementar como aplicación web y pegar la URL /exec
 * en api-config.js dentro de este mismo repositorio.
 */
const MAPA5K_SPREADSHEET_ID = '1I77KCptylJ6GX9KnlshDEZSRfK4BGasUOT93fXjBzTo';
const MAPA5K_SHEET_NAME = 'Mapa5K';
const MAPA5K_API_VERSION = '2026-10-26-mapa5k-v6';
const MAPA5K_HEADERS = [
  'ID','Nombre','Tipo','Geometria','Descripcion','Horario','Detalles',
  'Color','Visible','PuntosJSON','FechaActualizacion'
];

function doGet(e) {
  let result;
  try {
    const p = (e && e.parameter) || {};
    const action = String(p.action || 'mapa5kList');

    if (action === 'ping') {
      result = {ok:true, service:'Mapa 5K INJU–MIDES Florida'};
    } else if (action === 'mapa5kInicializar') {
      result = prepararMapa5K();
    } else if (action === 'mapa5kDiagnostico') {
      const sh = mapa5kSheet_();
      result = mapa5kDiagnostic_(sh);
    } else if (action === 'mapa5kList') {
      result = {ok:true, items:mapa5kList_()};
    } else if (action === 'mapa5kSave') {
      const payload = JSON.parse(String(p.data || '{}'));
      mapa5kVerifyAdminKey_(payload);
      result = {ok:true, items:mapa5kSave_(payload.items || [])};
    } else if (action === 'mapa5kGpsList') {
      result = {ok:true, items:mapa5kGpsList_()};
    } else if (action === 'mapa5kGpsActualizar') {
      result = mapa5kGpsActualizar_(JSON.parse(String(p.data || '{}')));
    } else if (action === 'mapa5kGpsDetener') {
      result = mapa5kGpsDetener_(JSON.parse(String(p.data || '{}')));
    } else if (action === 'mapa5kCarreraEstado') {
      result = mapa5kCarreraEstado_();
    } else if (action === 'mapa5kCarreraIniciar' || action === 'mapa5kCarreraFinalizar') {
      const payload = JSON.parse(String(p.data || '{}'));
      mapa5kVerifyAdminKey_(payload);
      result = mapa5kCarreraControl_(action);
    } else {
      throw new Error('Acción no reconocida: '+action);
    }
  } catch (err) {
    result = {ok:false, error:String(err && err.message ? err.message : err)};
  }

  result.apiVersion = MAPA5K_API_VERSION;
  result.jsonpSupported = true;
  const json = JSON.stringify(result).replace(/</g, '\\u003c');
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]{0,100}$/.test(callback)) {
    return ContentService.createTextOutput(callback+'('+json+');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}


const MAPA5K_GPS_SHEET = 'CorredoresGPS';
const MAPA5K_GPS_HEADERS = ['ID','AliasPublico','Latitud','Longitud','PrecisionMetros','Activo','ActualizadoMs'];
const MAPA5K_RACE_SHEET = 'CronometroCarrera';
const MAPA5K_RACE_HEADERS = ['Estado','InicioMs','FinMs','ActualizadoMs'];
const MAPA5K_GPS_MAX_AGE_MS = 45000;
const MAPA5K_GPS_RETENTION_MS = 24 * 60 * 60 * 1000;

function mapa5kVerifyAdminKey_(payload) {
  const configuredKey = String(PropertiesService.getScriptProperties().getProperty('ADMIN_KEY') || '').trim();
  const suppliedKey = String((payload && payload.key) || '').trim();
  if (!configuredKey) throw new Error('Falta configurar la propiedad ADMIN_KEY en el proyecto Apps Script.');
  if (suppliedKey !== configuredKey) throw new Error('Clave de edición incorrecta.');
}

function mapa5kEnsureTable_(name, headers) {
  const ss = SpreadsheetApp.openById(MAPA5K_SPREADSHEET_ID);
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  } else {
    const width = Math.max(sh.getLastColumn(), headers.length);
    const current = sh.getRange(1, 1, 1, width).getDisplayValues()[0];
    const matches = headers.every((header, i) => current[i] === header);
    if (!matches) {
      if (sh.getLastRow() <= 1) {
        sh.getRange(1, 1, 1, headers.length).setValues([headers]);
        if (sh.getLastColumn() > headers.length) {
          sh.getRange(1, headers.length + 1, 1, sh.getLastColumn() - headers.length).clearContent();
        }
      } else {
        throw new Error('La pestaña ' + name + ' contiene datos con encabezados diferentes. No se modificó para proteger la información existente.');
      }
    }
    sh.setFrozenRows(1);
  }
  return sh;
}

function mapa5kEnsureAuxiliarySheets_() {
  mapa5kEnsureTable_(MAPA5K_GPS_SHEET, MAPA5K_GPS_HEADERS);
  mapa5kEnsureTable_(MAPA5K_RACE_SHEET, MAPA5K_RACE_HEADERS);
}

function mapa5kGpsList_() {
  const sh = mapa5kEnsureTable_(MAPA5K_GPS_SHEET, MAPA5K_GPS_HEADERS);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const now = Date.now();
  return sh.getRange(2, 1, last - 1, MAPA5K_GPS_HEADERS.length).getValues()
    .filter(row => row[0] && (row[5] === true || String(row[5]).toLowerCase() === 'true'))
    .map(row => {
      const updatedAt = Number(row[6]) || 0;
      return {
        id: String(row[0]),
        alias: String(row[1] || 'Corredor'),
        lat: Number(row[2]),
        lng: Number(row[3]),
        accuracy: Number(row[4]) || null,
        updatedAt: updatedAt,
        ageSeconds: Math.max(0, Math.floor((now - updatedAt) / 1000))
      };
    })
    .filter(item => item.updatedAt > 0 && now - item.updatedAt <= MAPA5K_GPS_MAX_AGE_MS &&
      Number.isFinite(item.lat) && item.lat >= -90 && item.lat <= 90 &&
      Number.isFinite(item.lng) && item.lng >= -180 && item.lng <= 180);
}

function mapa5kGpsActualizar_(payload) {
  const id = String((payload && payload.id) || '').trim();
  const alias = String((payload && payload.alias) || '').trim().slice(0, 32);
  const lat = Number(payload && payload.lat);
  const lng = Number(payload && payload.lng);
  const accuracy = Number(payload && payload.accuracy);
  if (!/^[a-zA-Z0-9_-]{12,80}$/.test(id)) throw new Error('Identificador de seguimiento no válido.');
  if (!alias) throw new Error('Ingresá un dorsal o alias público antes de compartir tu ubicación.');
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error('La posición GPS recibida no es válida.');
  }
  const now = Date.now();
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sh = mapa5kEnsureTable_(MAPA5K_GPS_SHEET, MAPA5K_GPS_HEADERS);
    const last = sh.getLastRow();
    let targetRow = 0;
    if (last >= 2) {
      const rows = sh.getRange(2, 1, last - 1, MAPA5K_GPS_HEADERS.length).getValues();
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][0] || '') === id) targetRow = i + 2;
      }
    }
    const row = [id, alias, lat, lng, Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : '', true, now];
    if (targetRow) sh.getRange(targetRow, 1, 1, MAPA5K_GPS_HEADERS.length).setValues([row]);
    else sh.appendRow(row);
    // Prune only this GPS sheet; keep latest positions and remove records older than 24 hours.
    const afterWriteLast = sh.getLastRow();
    if (afterWriteLast >= 2) {
      const currentRows = sh.getRange(2, 1, afterWriteLast - 1, MAPA5K_GPS_HEADERS.length).getValues();
      for (let i = currentRows.length - 1; i >= 0; i--) {
        const updatedAt = Number(currentRows[i][6]) || 0;
        if (updatedAt <= 0 || now - updatedAt > MAPA5K_GPS_RETENTION_MS) sh.deleteRow(i + 2);
      }
    }
    SpreadsheetApp.flush();
    return {ok:true, updatedAt:now};
  } finally {
    lock.releaseLock();
  }
}

function mapa5kGpsDetener_(payload) {
  const id = String((payload && payload.id) || '').trim();
  if (!/^[a-zA-Z0-9_-]{12,80}$/.test(id)) throw new Error('Identificador de seguimiento no válido.');
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sh = mapa5kEnsureTable_(MAPA5K_GPS_SHEET, MAPA5K_GPS_HEADERS);
    const last = sh.getLastRow();
    if (last >= 2) {
      const ids = sh.getRange(2, 1, last - 1, 1).getDisplayValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === id) {
          sh.getRange(i + 2, 6, 1, 2).setValues([[false, Date.now()]]);
          SpreadsheetApp.flush();
          break;
        }
      }
    }
    return {ok:true, stopped:true};
  } finally {
    lock.releaseLock();
  }
}

function mapa5kCarreraEstado_() {
  const sh = mapa5kEnsureTable_(MAPA5K_RACE_SHEET, MAPA5K_RACE_HEADERS);
  if (sh.getLastRow() < 2) sh.getRange(2, 1, 1, MAPA5K_RACE_HEADERS.length).setValues([['ESPERA', '', '', Date.now()]]);
  const row = sh.getRange(2, 1, 1, MAPA5K_RACE_HEADERS.length).getValues()[0];
  const status = String(row[0] || 'ESPERA');
  return {
    ok:true,
    state:['ESPERA','EN_CURSO','FINALIZADA'].includes(status) ? status : 'ESPERA',
    startAt:Number(row[1]) || null,
    finishAt:Number(row[2]) || null,
    updatedAt:Number(row[3]) || null
  };
}

function mapa5kCarreraControl_(action) {
  const sh = mapa5kEnsureTable_(MAPA5K_RACE_SHEET, MAPA5K_RACE_HEADERS);
  const current = mapa5kCarreraEstado_();
  const now = Date.now();
  let row;
  if (action === 'mapa5kCarreraIniciar') {
    row = ['EN_CURSO', now, '', now];
  } else {
    if (current.state !== 'EN_CURSO' || !current.startAt) {
      throw new Error('La carrera no está iniciada. Primero pulsá Iniciar carrera.');
    }
    row = ['FINALIZADA', current.startAt, now, now];
  }
  sh.getRange(2, 1, 1, MAPA5K_RACE_HEADERS.length).setValues([row]);
  SpreadsheetApp.flush();
  return mapa5kCarreraEstado_();
}

function mapa5kDiagnostic_(sheet) {
  return {
    ok:true,
    spreadsheetId:MAPA5K_SPREADSHEET_ID,
    spreadsheetUrl:'https://docs.google.com/spreadsheets/d/'+MAPA5K_SPREADSHEET_ID+'/edit',
    sheetName:sheet.getName(),
    headers:sheet.getRange(1,1,1,MAPA5K_HEADERS.length).getDisplayValues()[0],
    elements:Math.max(0,sheet.getLastRow()-1),
    lastRow:sheet.getLastRow()
  };
}

/** Ejecutar manualmente una vez para autorizar y crear/verificar la pestaña. */
function prepararMapa5K() {
  const sh = mapa5kSheet_();
  mapa5kEnsureAuxiliarySheets_();
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,MAPA5K_HEADERS.length)
    .setFontWeight('bold').setBackground('#0756a4').setFontColor('#ffffff');
  SpreadsheetApp.flush();
  return mapa5kDiagnostic_(sh);
}

function mapa5kSheet_() {
  const ss = SpreadsheetApp.openById(MAPA5K_SPREADSHEET_ID);
  let sh = ss.getSheetByName(MAPA5K_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(MAPA5K_SHEET_NAME);
    sh.getRange(1,1,1,MAPA5K_HEADERS.length).setValues([MAPA5K_HEADERS]);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.getRange(1,1,1,MAPA5K_HEADERS.length).setValues([MAPA5K_HEADERS]);
    sh.setFrozenRows(1);
  } else {
    const existing = sh.getRange(1,1,1,Math.max(sh.getLastColumn(),MAPA5K_HEADERS.length)).getDisplayValues()[0];
    const matches = MAPA5K_HEADERS.every((header,i) => existing[i] === header);
    if (!matches) {
      if (sh.getLastRow() <= 1) {
        sh.getRange(1,1,1,MAPA5K_HEADERS.length).setValues([MAPA5K_HEADERS]);
        if (sh.getLastColumn() > MAPA5K_HEADERS.length) {
          sh.getRange(1,MAPA5K_HEADERS.length+1,1,sh.getLastColumn()-MAPA5K_HEADERS.length).clearContent();
        }
        sh.setFrozenRows(1);
      } else {
        throw new Error('La pestaña Mapa5K contiene datos y sus encabezados no coinciden. No se modificó para proteger la información existente.');
      }
    }
  }
  return sh;
}

function mapa5kList_() {
  const sh = mapa5kSheet_();
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,MAPA5K_HEADERS.length).getValues()
    .filter(row => row[0])
    .map(row => ({
      id:String(row[0]),
      nombre:String(row[1] || ''),
      tipo:String(row[2] || 'otros'),
      geometria:String(row[3] || 'punto'),
      descripcion:String(row[4] || ''),
      horario:String(row[5] || ''),
      detalles:String(row[6] || ''),
      color:String(row[7] || '#0756a4'),
      visible:String(row[8]).toLowerCase() !== 'false',
      puntos:mapa5kParsePoints_(row[9])
    }));
}

function mapa5kParsePoints_(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function mapa5kSave_(items) {
  if (!Array.isArray(items)) throw new Error('Los elementos del mapa no tienen un formato válido.');
  if (items.length > 300) throw new Error('El mapa supera el máximo de 300 elementos por guardado.');

  const sh = mapa5kSheet_();
  const existing = sh.getLastRow() > 1
    ? sh.getRange(2,1,sh.getLastRow()-1,MAPA5K_HEADERS.length).getValues()
    : [];
  const rowById = {};
  existing.forEach((row,i) => { if (row[0]) rowById[String(row[0])] = i+2; });

  const seen = {};
  items.forEach(item => {
    if (!item || !item.id) throw new Error('Hay un elemento del mapa sin identificador.');
    const id = String(item.id);
    if (seen[id]) throw new Error('Hay identificadores duplicados en el mapa.');
    seen[id] = true;

    const row = [
      id, String(item.nombre || ''), String(item.tipo || 'otros'),
      String(item.geometria || 'punto'), String(item.descripcion || ''),
      String(item.horario || ''), String(item.detalles || ''),
      String(item.color || '#0756a4'), item.visible === false ? 'false' : 'true',
      JSON.stringify(mapa5kParsePoints_(item.puntos)), new Date()
    ];
    if (rowById[id]) {
      sh.getRange(rowById[id],1,1,MAPA5K_HEADERS.length).setValues([row]);
    } else {
      sh.appendRow(row);
      rowById[id] = sh.getLastRow();
    }
  });

  // Guardado acumulativo: nunca borra otras capas que no vengan en la petición.
  SpreadsheetApp.flush();
  const saved = mapa5kList_();
  const byId = {};
  saved.forEach(item => { byId[String(item.id)] = item; });
  items.forEach(item => {
    const check = byId[String(item.id)];
    if (!check) throw new Error('Google Sheets no confirmó el elemento: '+String(item.nombre || item.id));
    if (JSON.stringify(mapa5kParsePoints_(check.puntos)) !== JSON.stringify(mapa5kParsePoints_(item.puntos))) {
      throw new Error('Google Sheets no confirmó la geometría del elemento: '+String(item.nombre || item.id));
    }
  });
  return saved;
}
