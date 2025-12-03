import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, MousePointerClick, Users } from "lucide-react";
import { toast } from "sonner";

// Telegram WebApp types - SDK carregado via script tag no index.html
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        isExpanded: boolean;
        viewportHeight: number;
        platform: string;
      };
    };
    // Monetag SDK creates a function named show_ZONEID
    [key: string]: any;
  }
}

const DEFAULT_ZONE_ID = "10269314";
const SDK_FUNCTION_NAME = `show_${DEFAULT_ZONE_ID}`;

export default function MiniApp() {
  const [telegramId, setTelegramId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);

  const recordEventMutation = trpc.adEvents.recordEvent.useMutation();
  const statsQuery = trpc.adEvents.getStats.useQuery();
  const userEventsQuery = trpc.adEvents.getByTelegramId.useQuery(
    { telegramId, limit: 10 },
    { enabled: !!telegramId }
  );

  useEffect(() => {
    // Initialize Telegram WebApp - SDK já carregado via script tag
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      // Inicializar o Telegram WebApp
      tg.ready();
      tg.expand();

      console.log("Telegram WebApp initialized:", {
        platform: tg.platform,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight,
      });

      const user = tg.initDataUnsafe.user;
      if (user) {
        setTelegramId(user.id.toString());
        setUserName(user.first_name + (user.last_name ? ` ${user.last_name}` : ""));
        console.log("Telegram user detected:", user.id, user.first_name);
      } else {
        // Usuário não detectado, usar fallback
        console.warn("No Telegram user found, using test user");
        const testId = "test_user_" + Date.now();
        setTelegramId(testId);
        setUserName("Test User");
      }
    } else {
      // Fallback para testes fora do Telegram
      console.warn("Telegram WebApp SDK not found, using test mode");
      const testId = "test_user_" + Date.now();
      setTelegramId(testId);
      setUserName("Test User");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Load Monetag SDK
    if (!telegramId) return;

    // Check if SDK is already loaded
    if (typeof window[SDK_FUNCTION_NAME] === "function") {
      console.log("Monetag SDK already loaded");
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "//libtl.com/sdk.js";
    script.setAttribute("data-zone", DEFAULT_ZONE_ID);
    script.setAttribute("data-sdk", SDK_FUNCTION_NAME);
    script.async = true;

    script.onload = () => {
      console.log("Monetag SDK loaded successfully");
      
      // Wait a bit for SDK to initialize the global function
      setTimeout(() => {
        if (typeof window[SDK_FUNCTION_NAME] === "function") {
          setSdkReady(true);
          console.log(`SDK function ${SDK_FUNCTION_NAME} is ready`);
          
          // Record initial impression
          recordEventMutation.mutate({
            eventType: "impression",
            telegramId,
            zoneId: DEFAULT_ZONE_ID,
            userAgent: navigator.userAgent,
          });
        } else {
          console.error(`SDK function ${SDK_FUNCTION_NAME} not found`);
          toast.error("SDK carregado mas função não disponível");
        }
      }, 500);
    };

    script.onerror = () => {
      console.error("Failed to load Monetag SDK");
      toast.error("Falha ao carregar SDK de anúncios");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [telegramId]);

  const handleShowAd = async () => {
    const showAdFunction = window[SDK_FUNCTION_NAME];
    
    if (typeof showAdFunction !== "function") {
      toast.error("SDK de anúncios não está pronto");
      console.error(`Function ${SDK_FUNCTION_NAME} not available`);
      return;
    }

    try {
      // Call the SDK function with proper parameters
      // Using 'end' type for Rewarded Interstitial
      const result = await showAdFunction({
        type: 'end',
        ymid: telegramId,
        requestVar: 'mini_app_click'
      });

      console.log("Ad shown successfully:", result);

      // Record impression when ad is shown
      // Clicks will be recorded via Monetag postback to /api/monetag/postback
      recordEventMutation.mutate({
        eventType: "impression",
        telegramId,
        zoneId: DEFAULT_ZONE_ID,
        userAgent: navigator.userAgent,
        clickId: result?.click_id || undefined,
        revenue: result?.estimated_price?.toString() || undefined,
      });

      toast.success("Anúncio exibido com sucesso!");
      console.log("Impression recorded. Clicks will be tracked via Monetag postback.");
      
      // Refresh user events
      userEventsQuery.refetch();
      statsQuery.refetch();
    } catch (error) {
      console.error("Error showing ad:", error);
      toast.error("Erro ao exibir anúncio. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Telegram Ad Tracker
            </CardTitle>
            <CardDescription className="text-gray-600">
              Bem-vindo, {userName}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Estatísticas Globais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {statsQuery.data?.totalImpressions || 0}
                  </div>
                  <div className="text-sm text-gray-600">Impressões</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <MousePointerClick className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {statsQuery.data?.totalClicks || 0}
                  </div>
                  <div className="text-sm text-gray-600">Cliques</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {statsQuery.data?.uniqueUsers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Usuários</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ad Display */}
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Área de Anúncios
            </CardTitle>
            <CardDescription className="text-gray-600">
              Clique no botão para visualizar anúncios do Monetag
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button
                onClick={handleShowAd}
                disabled={!sdkReady}
                className="w-full max-w-xs"
                size="lg"
              >
                {!sdkReady ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando SDK...
                  </>
                ) : (
                  "Mostrar Anúncio"
                )}
              </Button>
            </div>

            <div className="text-center space-y-1">
              <div className="text-sm text-gray-500">
                Zone ID: {DEFAULT_ZONE_ID}
              </div>
              <div className="text-xs text-gray-400">
                SDK Status: {sdkReady ? "✓ Pronto" : "⏳ Carregando..."}
              </div>
              <div className="text-xs text-gray-400">
                Telegram ID: {telegramId}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Como funciona:</strong> Quando você clica em "Mostrar Anúncio", 
                o SDK do Monetag exibe um anúncio interativo. O sistema registra 
                automaticamente a impressão e o clique no banco de dados.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Events */}
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Seus Eventos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userEventsQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : userEventsQuery.data && userEventsQuery.data.length > 0 ? (
              <div className="space-y-2">
                {userEventsQuery.data.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {event.eventType === "impression" ? (
                        <Activity className="w-4 h-4 text-blue-600" />
                      ) : (
                        <MousePointerClick className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-medium text-gray-900 capitalize">
                        {event.eventType === "impression" ? "Impressão" : "Clique"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(event.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Nenhum evento registrado ainda. Clique em "Mostrar Anúncio" para começar!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
