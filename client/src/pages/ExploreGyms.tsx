import { Gym } from '../types/Role';

const dummyGyms: Gym[] = [
  {
    id: '1',
    name: 'Fitness First',
    location: 'Downtown, New York',
    services: ['Weight Training', 'Cardio', 'Yoga', 'Personal Training'],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: 'State-of-the-art fitness center with expert trainers and modern equipment.'
  },
  {
    id: '2',
    name: 'Power Gym',
    location: 'Midtown, Los Angeles',
    services: ['CrossFit', 'HIIT', 'Boxing', 'Swimming'],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: 'High-intensity training facility with professional coaches and group classes.'
  },
  {
    id: '3',
    name: 'Zen Fitness',
    location: 'Westside, Chicago',
    services: ['Yoga', 'Pilates', 'Meditation', 'Wellness'],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: 'Holistic fitness center focusing on mind-body wellness and relaxation.'
  },
];

const ExploreGyms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Explore Our Partner Gyms
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Find the perfect gym for your fitness journey
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {dummyGyms.map((gym) => (
            <div key={gym.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="relative h-48">
                <img
                  className="w-full h-full object-cover"
                  src={gym.image}
                  alt={gym.name}
                />
              </div>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{gym.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{gym.location}</p>
                <p className="mt-2 text-sm text-gray-600">{gym.description}</p>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {gym.services.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    View Portfolio
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreGyms; 