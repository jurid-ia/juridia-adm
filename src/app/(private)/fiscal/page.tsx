// "use client";

// import { Button } from "@/components/ui/button";
// import { Pagination } from "@/components/ui/Pagination";
// import { useApiContext } from "@/context/ApiContext"; // Import context hook
// import { cn, formatDate } from "@/lib/utils";
// import { FiscalNote, fiscalService } from "@/services/fiscal/fiscalService";
// import { Search } from "lucide-react";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import FiscalModal from "./_components/FiscalModal";

// export default function FiscalPage() {
//   const api = useApiContext(); // Get api instance
//   const [notes, setNotes] = useState<FiscalNote[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [viewNote, setViewNote] = useState<FiscalNote | undefined>(undefined);

//   // Pagination & Search State
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [meta, setMeta] = useState({
//     total: 0,
//     totalPages: 0,
//     page: 1,
//     limit: 20,
//   });

//   // Debounce search
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearch(search);
//       setPage(1); // Reset to page 1 on search
//     }, 500);
//     return () => clearTimeout(handler);
//   }, [search]);

//   // Load data when page or debouncedSearch changes
//   useEffect(() => {
//     loadData();
//   }, [page, debouncedSearch]);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const response = await fiscalService.getNotes(api, {
//         page,
//         limit: 20,
//         search: debouncedSearch,
//       }); 
//       setNotes(response.data);
//       setMeta(response.meta);
//     } catch (error) {
//       console.error(error);
//       toast.error("Erro ao carregar notas fiscais");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = () => {
//     setViewNote(undefined);
//     setIsModalOpen(true);
//   };
  
//   const handleView = (note: FiscalNote) => {
//       // Just mock view/edit
//       toast("Visualizar Nota (Mock)");
//   }

//   return (
//     <div className="flex flex-col gap-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-n-7 dark:text-n-1">Notas Fiscais</h1>
//         <Button onClick={handleCreate}>
//           <span className="mr-2">+</span> Emitir Nota
//         </Button>
//       </div>

//       {/* Search Input */}
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-n-4" />
//         <input
//           type="text"
//           placeholder="Buscar nota por número ou cliente..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full pl-10 pr-4 py-2 rounded-lg border border-n-3 dark:border-n-6 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
//         />
//       </div>

//       <div className="bg-n-1 dark:bg-n-8 rounded-xl p-6 shadow-sm overflow-x-auto">
//         {loading ? (
//           <div>Carregando...</div>
//         ) : (
//           <>
//             <table className="w-full text-left">
//               <thead>
//                 <tr className="border-b border-n-3 dark:border-n-6 text-n-4">
//                   <th className="pb-4 font-semibold">Número</th>
//                   <th className="pb-4 font-semibold">Cliente</th>
//                   <th className="pb-4 font-semibold">Emissão</th>
//                   <th className="pb-4 font-semibold">Status</th>
//                   <th className="pb-4 font-semibold">Valor</th>
//                   <th className="pb-4 font-semibold">Impostos</th>
//                   <th className="pb-4 font-semibold">Ações</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {notes.map((note) => (
//                   <tr
//                     key={note.id}
//                     className="border-b border-n-3/50 dark:border-n-6/50 hover:bg-n-2/50 dark:hover:bg-n-6/50 transition-colors cursor-pointer group"
//                     onClick={() => handleView(note)}
//                   >
//                     <td className="py-4 font-semibold text-n-7 dark:text-n-1">{note.number}</td>
//                     <td className="py-4 font-medium">{note.clientName}</td>
//                     <td className="py-4 text-n-4">{formatDate(note.issueDate)}</td>
//                     <td className="py-4">
//                       <span className={`px-2 py-1 rounded text-sm font-medium ${
//                           note.status === 'AUTHORIZED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
//                           note.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
//                           (note.status !== "AUTHORIZED" && note.status !== "SCHEDULED") ? 'bg-red-100 text-red-700' : 
//                           'bg-gray-100 text-gray-700'
//                       }`}>
//                           {note.status === 'AUTHORIZED' ? 'Autorizada' : note.status === 'SCHEDULED' ? 'Agendada' : 'Cancelada'}
//                       </span>
//                     </td>
//                     <td className="py-4 font-medium">R$ {Number(note.value).toFixed(2)}</td>
//                     <td className="py-4 text-n-4">R$ {Number(note.taxes).toFixed(2)}</td>
//                     <td className="py-4">
//                         <Button 
//                           variant="secondary" 
//                           className={cn("h-8 px-3 text-xs",
//                             !note.pdfUrl && 'opacity-50 cursor-not-allowed'
//                           )}
//                           onClick={(e) => { 
//                               e.stopPropagation(); 
//                               if (note.pdfUrl) {
//                                   window.open(note.pdfUrl, '_blank');
//                               } else {
//                                   toast("PDF indisponível");
//                               }
//                           }}
//                         >
//                             PDF
//                         </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {!loading && notes.length === 0 && (
//                 <div className="text-center text-n-4 py-8">Nenhuma nota fiscal encontrada.</div>
//             )}

//             {/* Pagination */}
//             <Pagination
//               currentPage={meta.page}
//               totalPages={meta.totalPages}
//               onPageChange={setPage}
//               totalItems={meta.total}
//             />
//           </>
//         )}
//       </div>

//       <FiscalModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSuccess={loadData}
//         note={viewNote} // Reusing for Edit logic if needed
//       />
//     </div>
//   );
// }

export default function Fiscal() {
  return<></>
}