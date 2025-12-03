import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, MousePointerClick, Users, RefreshCw, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const statsQuery = trpc.adEvents.getStats.useQuery(undefined, {
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const eventsQuery = trpc.adEvents.getAll.useQuery(
    { limit: 50 },
    {
      refetchInterval: 30000,
    }
  );

  const zonesQuery = trpc.adZones.getAll.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    statsQuery.refetch();
    eventsQuery.refetch();
    zonesQuery.refetch();
  };

  const calculateCTR = () => {
    if (!statsQuery.data) return 0;
    const { totalImpressions, totalClicks } = statsQuery.data;
    if (totalImpressions === 0) return 0;
    return ((totalClicks / totalImpressions) * 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Rastreamento</h1>
            <p className="text-gray-600 mt-1">Monitore o desempenho dos seus anúncios Monetag</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Total de Impressões
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              ) : (
                <div className="text-3xl font-bold text-gray-900">
                  {statsQuery.data?.totalImpressions.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-green-600" />
                Total de Cliques
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              ) : (
                <div className="text-3xl font-bold text-gray-900">
                  {statsQuery.data?.totalClicks.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Usuários Únicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              ) : (
                <div className="text-3xl font-bold text-gray-900">
                  {statsQuery.data?.uniqueUsers.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                CTR (Taxa de Cliques)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
              ) : (
                <div className="text-3xl font-bold text-gray-900">{calculateCTR()}%</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ad Zones */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Zonas de Anúncios</CardTitle>
            <CardDescription className="text-gray-600">
              Configurações das zonas Monetag ativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {zonesQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : zonesQuery.data && zonesQuery.data.length > 0 ? (
              <div className="space-y-3">
                {zonesQuery.data.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {zone.zoneName || `Zone ${zone.zoneId}`}
                      </div>
                      <div className="text-sm text-gray-600">ID: {zone.zoneId}</div>
                      {zone.zoneType && (
                        <div className="text-sm text-gray-500">Tipo: {zone.zoneType}</div>
                      )}
                    </div>
                    <Badge variant={zone.isActive ? "default" : "secondary"}>
                      {zone.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma zona configurada ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Eventos Recentes
            </CardTitle>
            <CardDescription className="text-gray-600">
              Últimos 50 eventos de impressão e clique
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : eventsQuery.data && eventsQuery.data.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Telegram ID</TableHead>
                      <TableHead>Zone ID</TableHead>
                      <TableHead>Click ID</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Data/Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsQuery.data.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Badge
                            variant={event.eventType === "impression" ? "secondary" : "default"}
                          >
                            {event.eventType === "impression" ? (
                              <>
                                <Activity className="w-3 h-3 mr-1" />
                                Impressão
                              </>
                            ) : (
                              <>
                                <MousePointerClick className="w-3 h-3 mr-1" />
                                Clique
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {event.telegramId || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{event.zoneId}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {event.clickId ? event.clickId.substring(0, 12) + "..." : "-"}
                        </TableCell>
                        <TableCell>{event.country || "-"}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(event.createdAt).toLocaleString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum evento registrado ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
