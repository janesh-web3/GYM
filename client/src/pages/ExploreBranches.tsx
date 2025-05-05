import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, Search, Filter, Loader, LayoutGrid, List } from "lucide-react";
import { apiMethods } from "../lib/api";

interface Branch {
  _id: string;
  branchName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  description?: string;
  photos: Array<{ url: string; caption?: string }>;
  status: string;
  memberCount?: number;
  gymId: {
    _id: string;
    gymName: string;
    logo?: {
      url: string;
    }
  };
}

interface PaginatedBranchesResponse {
  branches: Branch[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const ExploreBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params: Record<string, string> = { 
          page: page.toString(),
          limit: "9"
        };
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        if (cityFilter) {
          params.city = cityFilter;
        }
        
        const response = await apiMethods.get("/branches/public", { params });
        const data = response as PaginatedBranchesResponse;
        
        setBranches(data.branches);
        setTotalPages(data.pagination.pages);
        
        // Extract unique cities if we don't have them yet
        if (cities.length === 0) {
          const uniqueCities = Array.from(
            new Set(data.branches.map(branch => branch.address.city))
          ).sort();
          setCities(uniqueCities);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching branches:", err);
        setError("Failed to load branches. Please try again later.");
        setLoading(false);
      }
    };

    fetchBranches();
  }, [page, searchQuery, cityFilter]);

  const getBranchThumbnail = (branch: Branch) => {
    if (branch.photos && branch.photos.length > 0) {
      return branch.photos[0].url;
    } else if (branch.gymId.logo) {
      return branch.gymId.logo.url;
    }
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCityFilter(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Explore Gym Branches
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Find the perfect gym branch near you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mt-8 flex flex-col md:flex-row justify-between gap-4">
          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search branches..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="flex gap-4">
            <select
              className="pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={cityFilter}
              onChange={handleCityChange}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-l-md border ${
                  viewMode === "grid"
                    ? "bg-primary-50 border-primary-500 text-primary-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-r-md border ${
                  viewMode === "list"
                    ? "bg-primary-50 border-primary-500 text-primary-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-primary-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="mt-12 text-center text-red-500">{error}</div>
        ) : branches.length === 0 ? (
          <div className="mt-12 text-center text-gray-500">
            No branches found
            {searchQuery && " matching your search"}
            {cityFilter && ` in ${cityFilter}`}
          </div>
        ) : viewMode === "grid" ? (
          <div className="mt-8 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <div
                key={branch._id}
                className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-xl"
              >
                <div className="relative h-48">
                  <img
                    className="w-full h-full object-cover"
                    src={getBranchThumbnail(branch)}
                    alt={branch.branchName}
                  />
                  {branch.status !== "active" && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      {branch.status === "maintenance"
                        ? "Under Maintenance"
                        : "Inactive"}
                    </div>
                  )}
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {branch.branchName}
                      </h3>
                      <Link
                        to={`/gyms/${branch.gymId._id}`}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        {branch.gymId.gymName}
                      </Link>
                    </div>
                    {branch.memberCount !== undefined && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{branch.memberCount}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>
                      {branch.address.city}, {branch.address.state}
                    </span>
                  </p>
                  {branch.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {branch.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <Link
                      to={`/gyms/branches/${branch._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
            <ul className="divide-y divide-gray-200">
              {branches.map((branch) => (
                <li key={branch._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden">
                        <img
                          className="h-full w-full object-cover"
                          src={getBranchThumbnail(branch)}
                          alt={branch.branchName}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {branch.branchName}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 sm:space-x-4">
                          <Link
                            to={`/gyms/${branch.gymId._id}`}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            {branch.gymId.gymName}
                          </Link>
                          <div className="flex items-center mt-1 sm:mt-0">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>
                              {branch.address.city}, {branch.address.state}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center">
                      {branch.memberCount !== undefined && (
                        <div className="flex items-center text-gray-500 text-sm mr-4">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{branch.memberCount}</span>
                        </div>
                      )}
                      <Link
                        to={`/gyms/branches/${branch._id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
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
                  <Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                        p === page
                          ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  </Fragment>
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

export default ExploreBranches; 