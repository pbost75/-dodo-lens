import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo et titre */}
            <div className="mb-8">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                🎬 DodoLens
              </h1>
              <p className="text-xl lg:text-2xl font-light opacity-90">
                Calculateur de volume révolutionnaire
              </p>
            </div>
            
            {/* Proposition de valeur */}
            <div className="mb-12">
              <h2 className="text-2xl lg:text-3xl font-semibold mb-6">
                Filmez votre intérieur, l'IA fait le reste !
              </h2>
              <p className="text-lg lg:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                Fini les listes interminables d'objets ! Avec DodoLens, 
                <strong> filmez simplement votre intérieur</strong> en commentant 
                à l'oral ce que vous voulez déménager. Notre IA analyse automatiquement 
                vos vidéos pour vous donner une estimation précise de votre volume.
              </p>
            </div>
            
            {/* CTA principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/record">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4">
                  🎬 Essayer le MVP
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
              >
                📺 Voir la démo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Décoration visuelle */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>
      
      {/* Comment ça marche */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16 text-gray-900">
              Comment ça marche ?
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              {/* Étape 1 */}
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎬</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  1. Filmez votre intérieur
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Parcourez vos pièces avec votre smartphone en commentant 
                  à l'oral ce que vous voulez déménager ou laisser.
                </p>
              </Card>
              
              {/* Étape 2 */}
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  2. L'IA analyse tout
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Notre intelligence artificielle combine l'analyse vidéo 
                  et vos commentaires pour identifier tous vos objets.
                </p>
              </Card>
              
              {/* Étape 3 */}
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  3. Éditez et validez
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Vérifiez le tableau généré, modifiez si nécessaire, 
                  et obtenez votre volume total précis instantanément.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* MVP Notice */}
      <section className="py-16 lg:py-24 bg-yellow-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                🚧 Version MVP - Test en cours
              </h3>
              <p className="text-yellow-700">
                Cette version de test inclut les fonctionnalités de base : 
                <strong> enregistrement vidéo + reconnaissance vocale + génération de tableau</strong>.
                L'IA utilise des données simulées pour démontrer le concept.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 text-left">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-green-600 font-semibold mb-2">✅ Fonctionnel</div>
                <ul className="text-sm space-y-1">
                  <li>• Enregistrement vidéo mobile</li>
                  <li>• Reconnaissance vocale temps réel</li>
                  <li>• Génération tableau d'objets</li>
                  <li>• Édition interactive</li>
                  <li>• Calcul volume total</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-yellow-600 font-semibold mb-2">🔄 Simulé (MVP)</div>
                <ul className="text-sm space-y-1">
                  <li>• Analyse IA des images</li>
                  <li>• Détection objets automatique</li>
                  <li>• Fusion vidéo + audio</li>
                  <li>• Score de confiance</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-blue-600 font-semibold mb-2">🚀 Prochainement</div>
                <ul className="text-sm space-y-1">
                  <li>• OpenAI Vision API réelle</li>
                  <li>• Intégration funnel Dodomove</li>
                  <li>• Backend centralisé</li>
                  <li>• Sauvegarde Airtable</li>
                  <li>• Emails automatiques</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Final */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
              Testez dès maintenant le MVP !
            </h2>
            <p className="text-xl mb-12 opacity-90">
              Découvrez l'expérience révolutionnaire du calculateur vidéo
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/record">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4">
                  🎬 Tester le MVP
                </Button>
              </Link>
            </div>
            
            <p className="text-sm opacity-75 mt-8">
              ✅ Gratuit • ✅ Sans inscription • ✅ Test immédiat
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer minimal */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm opacity-75">
                © 2024 DodoLens MVP by Dodomove
              </p>
            </div>
            <div className="flex space-x-6">
              <span className="text-sm opacity-75">
                Version MVP - Test en développement
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}