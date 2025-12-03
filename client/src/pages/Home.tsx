import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Activity, MousePointerClick, BarChart3, Zap, Shield, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-white" />
              <span className="text-xl font-bold text-white">Telegram Ad Tracker</span>
            </div>
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="w-20 h-10 bg-white/20 rounded animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/mini-app">
                    <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                      Mini App
                    </Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                    Entrar
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Rastreie Anúncios do Monetag em Tempo Real
          </h1>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Sistema completo de rastreamento para anúncios Monetag em Telegram Mini Apps. 
            Monitore impressões, cliques e receita com precisão total.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/mini-app">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                    <Zap className="w-5 h-5 mr-2" />
                    Abrir Mini App
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-2 border-white text-white hover:bg-white/10"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Ver Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Começar Agora
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Activity className="w-10 h-10 mb-4 text-blue-300" />
              <CardTitle className="text-white">Rastreamento em Tempo Real</CardTitle>
              <CardDescription className="text-white/80">
                Registre impressões e cliques instantaneamente com integração direta ao SDK do Monetag
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <MousePointerClick className="w-10 h-10 mb-4 text-green-300" />
              <CardTitle className="text-white">API de Postback</CardTitle>
              <CardDescription className="text-white/80">
                Receba notificações automáticas do Monetag sobre eventos de anúncios via webhook
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <BarChart3 className="w-10 h-10 mb-4 text-purple-300" />
              <CardTitle className="text-white">Dashboard Analítico</CardTitle>
              <CardDescription className="text-white/80">
                Visualize estatísticas detalhadas com gráficos e tabelas de desempenho
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Zap className="w-10 h-10 mb-4 text-yellow-300" />
              <CardTitle className="text-white">Telegram Mini App</CardTitle>
              <CardDescription className="text-white/80">
                Interface otimizada para Telegram com detecção automática de usuários
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Shield className="w-10 h-10 mb-4 text-red-300" />
              <CardTitle className="text-white">Banco de Dados MySQL</CardTitle>
              <CardDescription className="text-white/80">
                Armazenamento confiável e escalável com schema otimizado para análise
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <TrendingUp className="w-10 h-10 mb-4 text-orange-300" />
              <CardTitle className="text-white">Métricas de Performance</CardTitle>
              <CardDescription className="text-white/80">
                CTR, usuários únicos, receita e muito mais em um só lugar
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Configure seu sistema de rastreamento Monetag em minutos e comece a monitorar 
              seus anúncios hoje mesmo.
            </p>
            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Criar Conta Grátis
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/80">
            <p>© 2024 Telegram Ad Tracker. Sistema de rastreamento Monetag.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
