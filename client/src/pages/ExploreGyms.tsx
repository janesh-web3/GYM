import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Gym } from "../types/Role";
import { getActiveGyms } from "../services/gymService";
import { FaMapMarkerAlt, FaSpinner } from "react-icons/fa";

interface PaginatedGymsResponse {
  gyms: Gym[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const ExploreGyms = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        setLoading(true);
        const data = (await getActiveGyms(page)) as PaginatedGymsResponse;
        setGyms(data.gyms);
        setTotalPages(data.pagination.pages);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching gyms:", err);
        setError("Failed to load gyms. Please try again later.");
        setLoading(false);
      }
    };

    fetchGyms();
  }, [page]);

  const getGymThumbnail = (gym: Gym) => {
    if (gym.logo && gym.logo.url) {
      return gym.logo.url;
    } else if (gym.photos && gym.photos.length > 0) {
      return gym.photos[0].url;
    }
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  };

  const formatAddress = (address: Gym["address"]) => {
    return `${address.city}, ${address.state}`;
  };

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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="h-8 w-8 text-primary-600 animate-spin">
              <FaSpinner />
            </span>
          </div>
        ) : error ? (
          <div className="mt-12 text-center text-red-500">{error}</div>
        ) : gyms.length === 0 ? (
          <div className="mt-12 text-center text-gray-500">No gyms found</div>
        ) : (
          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {gyms.map((gym) => (
              <div
                key={gym._id}
                className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-xl"
              >
                <div className="relative h-48">
                  <img
                    className="w-full h-full object-cover"
                    src={getGymThumbnail(gym)}
                    alt={gym.gymName}
                  />
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {gym.gymName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 flex items-center">
                    <FaMapMarkerAlt />
                    {formatAddress(gym.address)}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {gym.description}
                  </p>
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {gym.services.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {service.name}
                        </span>
                      ))}
                      {gym.services.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{gym.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Link
                      to={`/gyms/${gym._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Details
                    </Link>
                    {gym.branches && gym.branches.length > 0 && (
                      <Link
                        to={`/gyms/${gym._id}#branches`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        View Branches ({gym.branches.length})
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  page === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 1 && p <= page + 1)
                )
                .map((p, i, arr) => (
                  <>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                        p === page
                          ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  </>
                ))}

              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  page === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreGyms;
