import { useState } from 'react';
import { Plus, Edit2, Trash2, Star, Mail, Phone, User } from 'lucide-react';

interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  rating: number;
  image: string;
  bio: string;
}

const Trainers = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      specialization: 'Strength Training',
      experience: '5 years',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      bio: 'Certified personal trainer with expertise in strength training and bodybuilding.',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 987-6543',
      specialization: 'Yoga & Pilates',
      experience: '3 years',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      bio: 'Experienced yoga instructor with a focus on mindfulness and flexibility training.',
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const [newTrainer, setNewTrainer] = useState<Omit<Trainer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    rating: 0,
    image: '',
    bio: '',
  });

  const handleAddTrainer = () => {
    const trainer: Trainer = {
      ...newTrainer,
      id: Date.now().toString(),
    };
    setTrainers((prev) => [...prev, trainer]);
    setIsAddModalOpen(false);
    setNewTrainer({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience: '',
      rating: 0,
      image: '',
      bio: '',
    });
  };

  const handleEditTrainer = () => {
    if (!selectedTrainer) return;
    setTrainers((prev) =>
      prev.map((trainer) =>
        trainer.id === selectedTrainer.id ? selectedTrainer : trainer
      )
    );
    setIsEditModalOpen(false);
    setSelectedTrainer(null);
  };

  const handleDeleteTrainer = (id: string) => {
    setTrainers((prev) => prev.filter((trainer) => trainer.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Trainer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <div
            key={trainer.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="relative">
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedTrainer(trainer);
                    setIsEditModalOpen(true);
                  }}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteTrainer(trainer.id)}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {trainer.name}
                </h3>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {trainer.rating}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {trainer.specialization}
              </p>
              <p className="text-sm text-gray-500 mb-4">{trainer.experience}</p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {trainer.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {trainer.phone}
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">{trainer.bio}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Trainer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Trainer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newTrainer.name}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={newTrainer.email}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newTrainer.phone}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, phone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specialization
                </label>
                <input
                  type="text"
                  value={newTrainer.specialization}
                  onChange={(e) =>
                    setNewTrainer({
                      ...newTrainer,
                      specialization: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Experience
                </label>
                <input
                  type="text"
                  value={newTrainer.experience}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, experience: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={newTrainer.bio}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, bio: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTrainer}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Trainer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trainer Modal */}
      {isEditModalOpen && selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Trainer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={selectedTrainer.name}
                  onChange={(e) =>
                    setSelectedTrainer({
                      ...selectedTrainer,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedTrainer.email}
                  onChange={(e) =>
                    setSelectedTrainer({
                      ...selectedTrainer,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={selectedTrainer.phone}
                  onChange={(e) =>
                    setSelectedTrainer({
                      ...selectedTrainer,
                      phone: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specialization
                </label>
                <input
                  type="text"
                  value={selectedTrainer.specialization}
                  onChange={(e) =>
                    setSelectedTrainer({
                      ...selectedTrainer,
                      specialization: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Experience
                </label>
                <input
                  type="text"
                  value={selectedTrainer.experience}
                  onChange={(e) =>
                    setSelectedTrainer({
                      ...selectedTrainer,
                      experience: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={selectedTrainer.bio}
                  onChange={(e) =>
                    setSelectedTrainer({
                      ...selectedTrainer,
                      bio: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedTrainer(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTrainer}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers; 