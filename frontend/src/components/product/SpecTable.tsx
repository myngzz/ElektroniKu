import { SpecField } from'@/types';

interface SpecTableProps {
 specifications: Record<string, unknown>;
 specFields?: SpecField[];
}

export default function SpecTable({ specifications, specFields }: SpecTableProps) {
 const specs = specifications instanceof Map
 ? Object.fromEntries(specifications)
 : specifications;

 const entries = Object.entries(specs || {});
 if (entries.length === 0) return null;

 const getLabel = (key: string): string => {
 if (specFields) {
 const field = specFields.find((f) => f.key === key);
 if (field) return field.label;
 }
 // Format camelCase/snake_case menjadi Title Case
 return key
 .replace(/_/g,'')
 .replace(/([A-Z])/g,' $1')
 .replace(/^\w/, (c) => c.toUpperCase())
 .trim();
 };

 const getUnit = (key: string): string => {
 if (specFields) {
 const field = specFields.find((f) => f.key === key);
 if (field?.unit) return ` ${field.unit}`;
 }
 return'';
 };

 const formatValue = (value: unknown): string => {
 if (typeof value ==='boolean') return value ?'Ya' :'Tidak';
 if (value === null || value === undefined) return'-';
 return String(value);
 };

 return (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <tbody>
 {entries.map(([key, value], index) => (
 <tr
 key={key}
 className={`${index % 2 === 0 ?'bg-gray-50' :'bg-white'}`}
 >
 <td className="px-4 py-3 font-medium text-gray-600 w-2/5 rounded-l-lg">
 {getLabel(key)}
 </td>
 <td className="px-4 py-3 text-gray-900 font-semibold rounded-r-lg">
 {formatValue(value)}{getUnit(key)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}
