import { zipSync, strToU8 } from 'fflate';
import { readXlsx } from './xlsx';

/** Testte gerçek bir .xlsx üretir (fflate ile zip'lenmiş minimal OOXML). */
const makeXlsx = () => {
  const shared = `<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="6" uniqueCount="6">
<si><t>Saat</t></si><si><t>1-A</t></si><si><t>5-B</t></si>
<si><t>Origami (Eda Nur Keklik)</t></si><si><t>Kimya &amp; Fizik</t></si><si><t>DERS YOK</t></si></sst>`;
  // A1:Saat B1:1-A C1:5-B / A2: 0.375 (09:00 saat biçimi) B2:Origami(...) C2:Kimya & Fizik
  // A3: metin "09:55-10:35"  (B3 boş, C3:DERS YOK  → boş hücre korunmalı)
  const sheet = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row>
<row r="2"><c r="A2"><v>0.375</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row>
<row r="3"><c r="A3" t="inlineStr"><is><t>09:55-10:35</t></is></c><c r="C3" t="s"><v>5</v></c></row>
</sheetData></worksheet>`;
  const zip = zipSync({
    '[Content_Types].xml': strToU8('<?xml version="1.0"?><Types/>'),
    'xl/sharedStrings.xml': strToU8(shared),
    'xl/worksheets/sheet1.xml': strToU8(sheet),
  });
  return zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength);
};

test('xlsx okuyucu: paylaşılan metin, satır içi metin, saat serisi ve boş hücre', () => {
  const rows = readXlsx(makeXlsx());
  expect(rows[0]).toEqual(['Saat', '1-A', '5-B']);
  expect(rows[1][0]).toBe('09:00');                    // 0.375 → saat
  expect(rows[1][1]).toBe('Origami (Eda Nur Keklik)');
  expect(rows[1][2]).toBe('Kimya & Fizik');            // XML entity çözüldü
  expect(rows[2]).toEqual(['09:55-10:35', '', 'DERS YOK']); // B3 boş ama hizalama bozulmadı
});
