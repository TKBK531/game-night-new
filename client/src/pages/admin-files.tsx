import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Download } from "lucide-react";

interface FileInfo {
    teamId: number;
    teamName: string;
    fileName: string;
    fileUrl: string | null;
    uploadedAt: string;
}

export default function AdminFiles() {
    const { data: files, isLoading, error } = useQuery<FileInfo[]>({
        queryKey: ['/api/admin/files'],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/admin/files");
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#111823] to-[#1a2332] p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-orbitron font-bold text-[#ff4654] mb-8">Loading Files...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#111823] to-[#1a2332] p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-orbitron font-bold text-[#ff4654] mb-8">Error Loading Files</h1>
                    <p className="text-gray-300">Unable to load uploaded files.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#111823] to-[#1a2332] p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-orbitron font-bold text-[#ff4654] mb-8">
                    Uploaded Bank Slips ({files?.length || 0})
                </h1>

                {files && files.length > 0 ? (
                    <div className="grid gap-4">
                        {files.map((file) => (
                            <Card key={file.teamId} className="bg-[#1a2332] border-[#ff4654]/30">
                                <CardHeader>
                                    <CardTitle className="text-[#ff4654] flex items-center justify-between">
                                        <span>{file.teamName}</span>
                                        <span className="text-sm text-gray-400">
                                            Team ID: {file.teamId}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-300 mb-2">
                                                <strong>Uploaded:</strong> {new Date(file.uploadedAt).toLocaleString()}
                                            </p>
                                            {file.fileUrl ? (
                                                <div className="flex items-center gap-4">
                                                    <a
                                                        href={file.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 bg-[#ff4654] text-white px-4 py-2 rounded-lg hover:bg-[#ba3a46] transition-colors"
                                                    >
                                                        <ExternalLink size={16} />
                                                        View File
                                                    </a>
                                                    <a
                                                        href={`/api/files/${file.teamId}/bank-slip`}
                                                        className="flex items-center gap-2 bg-[#242d3d] text-white px-4 py-2 rounded-lg hover:bg-[#1a2332] transition-colors"
                                                    >
                                                        <Download size={16} />
                                                        Direct Link
                                                    </a>
                                                </div>
                                            ) : (
                                                <p className="text-red-400">File URL not available</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-[#1a2332] border-[#ff4654]/30">
                        <CardContent className="p-8 text-center">
                            <p className="text-gray-300 text-lg">No bank slips uploaded yet.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
