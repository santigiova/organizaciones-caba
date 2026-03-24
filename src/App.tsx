import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Leaf, Filter, Search, MapPin, Tag, RefreshCw, BarChart2, Heart, CheckCircle2, Users } from 'lucide-react';

// --- Supabase Config ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Definitions ---
interface Org {
    id: string;
    nombre_asociacion: string;
    temas_principales: string[];
    temas_secundarios: string[];
    rama: string;
    descripcion_breve: string;
    instagram_url?: string;
    instagram_followers?: number;
    facebook_url?: string;
    email_contacto?: string;
    telefono_contacto?: string;
    pagina_web?: string;
    barrio_o_zona?: string;
    evidencia_fuentes: string[];
    confidence_score: number;
    estado_validacion: 'alta' | 'media' | 'baja';
    observaciones?: string;
}

const TEMAS_PERMITIDOS = [
    "espacios verdes", "cultura", "alimentación", "salud mental", "accesibilidad",
    "movilidad", "hábitat", "medio ambiente", "género", "educación",
    "adultos mayores", "derechos", "animales", "tecnología",
    "consumo problemático", "migrantes", "salud comunitaria", "deporte"
];

const TEMA_COLORS: Record<string, string> = {
    "espacios verdes": "#10b981",
    "medio ambiente": "#10b981",
    "alimentación": "#f59e0b",
    "cultura": "#8b5cf6",
    "tecnología": "#3b82f6",
    "salud mental": "#ec4899",
    "salud comunitaria": "#ec4899",
    "género": "#d946ef",
    "derechos": "#6366f1",
    "accesibilidad": "#06b6d4",
    "deporte": "#f97316",
    "educación": "#eab308",
    "animales": "#14b8a6",
    "hábitat": "#0ea5e9",
    "movilidad": "#0ea5e9",
    "adultos mayores": "#64748b",
    "migrantes": "#8b5cf6",
    "consumo problemático": "#ef4444"
};

interface CardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
}

const Card = ({ title, value, icon, subtitle }: CardProps) => (
    <div className="card-base p-6 flex flex-col justify-between h-full hover:shadow-md hover:scale-[1.02] transform transition-all group">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{title}</h3>
            <div className="text-slate-400 group-hover:text-blue-500 transition-colors">{icon}</div>
        </div>
        <div className="text-4xl font-black tracking-tighter text-slate-800 mb-4 font-['Montserrat',sans-serif]">
            {value}
        </div>
        {subtitle && (
            <div className="text-xs font-medium pt-4 border-t border-slate-100 text-slate-400">
                {subtitle}
            </div>
        )}
    </div>
);

const TemaBadge = ({ tema, isSecondary = false }: { tema: string, isSecondary?: boolean }) => {
    const baseColor = TEMA_COLORS[tema] || "#64748b";
    return (
        <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap"
            style={{
                borderColor: isSecondary ? '#e2e8f0' : baseColor,
                color: isSecondary ? '#94a3b8' : baseColor,
                backgroundColor: isSecondary ? '#f8fafc' : `${baseColor}15`
            }}
        >
            {tema.toUpperCase()}
        </span>
    );
};

function formatFollowers(n?: number): string {
    if (!n) return '—';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
}

export default function App() {
    const [data, setData] = useState<Org[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filtroTema, setFiltroTema] = useState<string>('');
    const [filtroBarrio, setFiltroBarrio] = useState<string>('');
    const [filtroContacto, setFiltroContacto] = useState<boolean>(false);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        let query = supabase.from('organizaciones').select('*');
        if (filtroTema) query = query.contains('temas_principales', [filtroTema]);
        if (filtroBarrio) query = query.ilike('barrio_o_zona', `%${filtroBarrio}%`);
        if (filtroContacto) query = query.not('instagram_url', 'is', null);
        query = query.order('nombre_asociacion', { ascending: true }).limit(200);

        const { data: result, error } = await query;
        if (error) {
            console.error("Error:", error);
        } else {
            const limpio = (result || []).filter(r =>
                r.nombre_asociacion &&
                r.nombre_asociacion.toLowerCase() !== 'null' &&
                r.nombre_asociacion !== ''
            );
            setData(limpio);
        }
        setLoading(false);
    }, [filtroTema, filtroBarrio, filtroContacto]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const stats = useMemo(() => ({
        total: data.length,
        altaConfianza: data.filter(d => d.estado_validacion === 'alta').length,
        conIG: data.filter(d => !!d.instagram_url).length,
        barriosU: new Set(data.map(d => d.barrio_o_zona).filter(Boolean)).size
    }), [data]);

    return (
        <div className="min-h-screen pb-16">
            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between z-50 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <div className="h-7 w-[1px] bg-slate-200" />
                    <div>
                        <div className="text-[9px] font-bold text-blue-600 tracking-[0.25em] uppercase">Intelligence Suite</div>
                        <h1 className="text-xl font-black italic tracking-tighter text-slate-800 font-['Montserrat',sans-serif]">
                            ORGANIZACIONES <span className="text-blue-500">CABA</span>
                        </h1>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 font-bold text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
                    Sincronizar
                </button>
            </header>

            <main className="pt-28 px-8 max-w-[1700px] mx-auto">
                <div className="mb-7">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dashboard de Descubrimiento</div>
                    <p className="text-sm text-slate-400 font-medium">Mapeo activo de organizaciones comunitarias en CABA, clasificadas por tema real.</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-4 gap-5 mb-7">
                    <Card title="Organizaciones" value={stats.total} icon={<BarChart2 className="w-5 h-5" />} subtitle="Registros activos en la base" />
                    <Card title="Alta Confianza" value={`${stats.total ? Math.round((stats.altaConfianza / stats.total) * 100) : 0}%`} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} subtitle={`${stats.altaConfianza} validadas`} />
                    <Card title="Con Instagram" value={stats.conIG} icon={<Heart className="w-5 h-5 text-pink-500" />} subtitle="Con presencia en IG detectada" />
                    <Card title="Cobertura" value={`${stats.barriosU} barrios`} icon={<MapPin className="w-5 h-5 text-amber-500" />} subtitle="Zonas de CABA cubiertas" />
                </div>

                {/* FILTROS */}
                <div className="card-base px-5 py-4 mb-7 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros</span>
                    </div>
                    <div className="flex flex-col min-w-[200px]">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"><Tag className="w-3 h-3 inline mr-1" />Tema</label>
                        <select className="bg-slate-50 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none" value={filtroTema} onChange={e => setFiltroTema(e.target.value)}>
                            <option value="">Todos los temas</option>
                            {TEMAS_PERMITIDOS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col min-w-[180px]">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"><MapPin className="w-3 h-3 inline mr-1" />Barrio</label>
                        <input type="text" placeholder="Ej. Caballito, Palermo..." className="bg-slate-50 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 border-none" value={filtroBarrio} onChange={e => setFiltroBarrio(e.target.value)} />
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer hover:text-blue-600 transition-colors mt-4">
                        <input type="checkbox" checked={filtroContacto} onChange={e => setFiltroContacto(e.target.checked)} className="rounded text-blue-600 w-4 h-4" />
                        Sólo con Instagram
                    </label>
                </div>

                {/* TABLA */}
                <div className="card-base border-t-4 border-t-blue-500 relative min-h-[400px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-100 border-t-blue-600" />
                                <span className="text-[10px] font-black tracking-widest uppercase text-blue-600">Sincronizando</span>
                            </div>
                        </div>
                    )}

                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-black italic tracking-tighter text-slate-800 font-['Montserrat',sans-serif] uppercase">Organizaciones Identificadas</h3>
                        <div className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">{data.length} REGISTROS</div>
                    </div>

                    {data.length === 0 && !loading ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <Search className="w-12 h-12 text-slate-200 mb-4" />
                            <p className="text-slate-500 font-bold mb-1">Sin resultados</p>
                            <p className="text-slate-400 text-sm">Ajustá los filtros para ver organizaciones.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
                                <colgroup>
                                    <col style={{ width: '20%' }} />
                                    <col style={{ width: '26%' }} />
                                    <col style={{ width: '18%' }} />
                                    <col style={{ width: '13%' }} />
                                    <col style={{ width: '13%' }} />
                                    <col style={{ width: '10%' }} />
                                </colgroup>
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-5 py-4 table-header">Organización</th>
                                        <th className="px-5 py-4 table-header">Descripción</th>
                                        <th className="px-5 py-4 table-header">Temas</th>
                                        <th className="px-5 py-4 table-header">Barrio</th>
                                        <th className="px-5 py-4 table-header">Instagram</th>
                                        <th className="px-5 py-4 table-header">
                                            <div className="flex items-center gap-1"><Users className="w-3 h-3" /> Followers</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.map(org => (
                                        <tr key={org.id} className="hover:bg-blue-50/20 transition-colors group">
                                            {/* Nombre */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors text-sm leading-snug break-words">
                                                    {org.nombre_asociacion}
                                                </div>
                                                {org.rama && org.rama.toLowerCase() !== 'null' && (
                                                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{org.rama}</div>
                                                )}
                                                {org.estado_validacion === 'alta' && (
                                                    <div className="mt-1.5 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> VALIDADA
                                                    </div>
                                                )}
                                            </td>

                                            {/* Descripción */}
                                            <td className="px-5 py-4 align-top text-xs text-slate-500 leading-relaxed break-words">
                                                {org.descripcion_breve}
                                            </td>

                                            {/* Temas */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {org.temas_principales?.map(t => <TemaBadge key={`p-${t}`} tema={t} />)}
                                                    {org.temas_secundarios?.slice(0, 2).map(t => <TemaBadge key={`s-${t}`} tema={t} isSecondary />)}
                                                </div>
                                            </td>

                                            {/* Barrio */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg inline-block leading-relaxed break-words w-full">
                                                    {org.barrio_o_zona || '—'}
                                                </div>
                                            </td>

                                            {/* Instagram */}
                                            <td className="px-5 py-4 align-top">
                                                {org.instagram_url ? (
                                                    <a href={org.instagram_url} target="_blank" rel="noreferrer"
                                                        className="group/ig flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors">
                                                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-pink-50 group-hover/ig:bg-pink-100 transition-colors text-xs">
                                                            📷
                                                        </span>
                                                        <span className="truncate">
                                                            {org.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/\/$/, '') || 'Ver perfil'}
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-300 font-medium">—</span>
                                                )}
                                                {org.pagina_web && (
                                                    <a href={org.pagina_web} target="_blank" rel="noreferrer"
                                                        className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 transition-colors font-medium">
                                                        🌐 Sitio web
                                                    </a>
                                                )}
                                            </td>

                                            {/* Followers */}
                                            <td className="px-5 py-4 align-top">
                                                {org.instagram_followers ? (
                                                    <div>
                                                        <div className="text-lg font-black text-slate-700 tracking-tight">
                                                            {formatFollowers(org.instagram_followers)}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-medium">seguidores</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-300 font-medium">—</span>
                                                )}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Fuentes desplegables en footer de cada row — eliminado para no clutterear la tabla */}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
