/**
 * API del mapa 5K INJU–MIDES Florida.
 * La pestaña Mapa5K se crea automáticamente en la hoja configurada.
 * ID de la hoja base: 113AiF1ahuZuEW9PWeHNhJYdJXMidZd084LmYOx7N6NU
 *
 * Configurar en Propiedades del script:
 * ADMIN_KEY = clave larga de edición
 * SPREADSHEET_ID es opcional; si existe, tiene prioridad sobre el ID predeterminado.
 */
const DEFAULT_SPREADSHEET_ID = '113AiF1ahuZuEW9PWeHNhJYdJXMidZd084LmYOx7N6NU';
const SHEET_NAME = 'Mapa5K';
const HEADERS = ['id','nombre','tipo','geometria','puntos_json','descripcion','horario','detalles','color','visible','actualizado'];

function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(p.callback || '') ? p.callback : '';
  let result;
  try {
    if (p.action === 'list') {
      result = { ok: true, items: readItems_() };
    } else if (p.action === 'save') {
      const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
      if (!expected || !p.data) throw new Error('Falta configurar ADMIN_KEY o los datos.');
      const payload = JSON.parse(p.data);
      if (!payload.key || payload.key !== expected) throw new Error('Clave de edición incorrecta.');
      if (!Array.isArray(payload.items)) throw new Error('La lista de elementos no es válida.');
      writeItems_(payload.items);
      result = { ok: true, count: payload.items.length, message: 'Guardado' };
    } else {
      result = { ok: true, service: 'Mapa 5K INJU–MIDES Florida', apiVersion: '1.1' };
    }
  } catch (err) {
    result = { ok: false, error: String(err && err.message ? err.message : err) };
  }
  const body = callback ? callback + '(' + JSON.stringify(result) + ');' : JSON.stringify(result);
  return ContentService.createTextOutput(body)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function readItems_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(row => row[0]).map(row => {
    const o = {};
    headers.forEach((h, i) => o[h] = row[i]);
    let puntos = [];
    try { puntos = JSON.parse(o.puntos_json || '[]'); } catch (_) {}
    return {
      id: String(o.id || ''),
      nombre: String(o.nombre || ''),
      tipo: String(o.tipo || 'otros'),
      geometria: String(o.geometria || 'punto'),
      puntos: puntos,
      descripcion: String(o.descripcion || ''),
      horario: String(o.horario || ''),
      detalles: String(o.detalles || ''),
      color: String(o.color || '#0756a4'),
      visible: o.visible === true || String(o.visible).toLowerCase() === 'true'
    };
  });
}

function writeItems_(items) {
  const sheet = getSheet_();
  const rows = [HEADERS];
  items.forEach(o => {
    if (!o || !o.id || !o.nombre) return;
    const puntos = Array.isArray(o.puntos) ? o.puntos.map(p => ({
      lat: Number(p.lat), lng: Number(p.lng)
    })).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng)) : [];
    rows.push([
      String(o.id), String(o.nombre), String(o.tipo || 'otros'),
      String(o.geometria || 'punto'), JSON.stringify(puntos),
      String(o.descripcion || ''), String(o.horario || ''),
      String(o.detalles || ''), String(o.color || '#0756a4'),
      o.visible !== false, new Date()
    ]);
  });
  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, HEADERS.length).setValues(rows);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, HEADERS.length);
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID;
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

/** Ejecutar manualmente una vez desde Apps Script para crear/preparar la pestaña Mapa5K. */
function prepararHoja5K() {
  const sheet = getSheet_();
  Logger.log('Hoja lista: ' + sheet.getParent().getUrl() + ' (' + sheet.getName() + ')');
}