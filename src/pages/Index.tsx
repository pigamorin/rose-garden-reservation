import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FlowerIcon, UsersIcon } from 'lucide-react';
import ReservationForm from '@/components/ReservationForm';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <FlowerIcon className="h-8 w-8 text-pink-600" />
              <h1 className="text-2xl font-bold text-pink-600">Rose Garden</h1>
            </div>
            
            <Link to="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Welcome Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Rose Garden
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Experience fine dining in an elegant atmosphere. Book your table today and let us create an unforgettable dining experience for you.
              </p>
            </div>
          </div>

          {/* Reservation Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-pink-600">Make a Reservation</CardTitle>
                <CardDescription>
                  Reserve your table at Rose Garden. We'll confirm your booking shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReservationForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}