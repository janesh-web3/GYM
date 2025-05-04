import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getActiveGyms,
  getFeaturedGyms,
  getAllGyms,
} from "../services/gymService";
import { gymService, productService } from "../lib/services";
import { Gym as GymType } from "../types/Role";
import { FaMapMarkerAlt, FaStar, FaArrowRight } from "react-icons/fa";

// Types
interface Gym {
  _id: string;
  gymName: string;
  description: string;
  address: {
    city: string;
    state: string;
  };
  photos: Array<{ url: string }>;
  videos: Array<{ url: string }>;
  services: Array<{ name: string }>;
  status: "pending" | "active" | "banned";
  rating?: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  inStock: boolean;
}

// Add this utility function for retry logic
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const LandingPage = () => {
  const [activeGyms, setActiveGyms] = useState<Gym[]>([]);
  const [featuredGyms, setFeaturedGyms] = useState<GymType[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  // Fetch featured gyms
  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedGyms = async (retryCount = 0, maxRetries = 3) => {
      try {
        setFeaturedLoading(true);

        // Add a small delay between retries
        if (retryCount > 0) {
          await sleep(1000 * retryCount);
        }

        const response = await getFeaturedGyms(6) as { success: boolean; data: GymType[] };

        if (isMounted && response.success) {
          setFeaturedGyms(response.data);
          setFeaturedError(null);
        }
      } catch (err: any) {
        console.error("Error fetching featured gyms:", err);

        if (isMounted) {
          // Retry if rate limited
          if (err?.response?.status === 429 && retryCount < maxRetries) {
            console.log(
              `Retrying featured gyms fetch... (${
                retryCount + 1
              }/${maxRetries})`
            );
            return fetchFeaturedGyms(retryCount + 1, maxRetries);
          }

          setFeaturedError("Failed to load featured gyms.");
        }
      } finally {
        if (isMounted) {
          setFeaturedLoading(false);
        }
      }
    };

    fetchFeaturedGyms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Set a flag to track component mount state
    let isMounted = true;

    const fetchData = async (retryCount = 0, maxRetries = 3) => {
      try {
        setLoading(true);

        // Add a small delay between retries to avoid rate limiting
        if (retryCount > 0) {
          await sleep(1000 * retryCount); // Exponential backoff
        }

        // Try to get gyms data first
        let activeGyms = [];
        try {
          const gymsResponse = (await gymService.getAllGyms("active")) as {
            data: Gym[];
          };
          activeGyms = gymsResponse.data;
          // Only update state if component is still mounted
          if (isMounted) {
            setActiveGyms(activeGyms);
          }
        } catch (gymsError: any) {
          console.warn("Error fetching gyms:", gymsError);
          // If we hit rate limit and have retries left, retry the request
          if (gymsError?.response?.status === 429 && retryCount < maxRetries) {
            if (isMounted) {
              console.log(
                `Retrying gyms fetch... (${retryCount + 1}/${maxRetries})`
              );
              return fetchData(retryCount + 1, maxRetries);
            }
            return;
          }
          // Otherwise, continue with what we have and try to fetch products
        }

        // Try to get products data
        try {
          const productsResponse = (await productService.getAllProducts(
            1,
            20,
            "",
            true
          )) as { data: Product[] };

          // Only update state if component is still mounted
          if (isMounted) {
            setFeaturedProducts(productsResponse.data);
            setError(null);
          }
        } catch (productsError) {
          console.warn("Error fetching products:", productsError);
          // We already have gyms, so we can show something even if products fail
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);

        // Only update state if component is still mounted
        if (isMounted) {
          // Retry if we hit rate limit
          if (err?.response?.status === 429 && retryCount < maxRetries) {
            console.log(`Retrying fetch... (${retryCount + 1}/${maxRetries})`);
            return fetchData(retryCount + 1, maxRetries);
          }

          setError("Failed to load content. Please try again later.");
        }
      } finally {
        // Only update state if component is still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to get a gym thumbnail image
  const getGymThumbnail = (gym: Gym | GymType) => {
    if ("logo" in gym && gym.logo?.url) {
      return gym.logo.url;
    } else if (gym.photos && gym.photos.length > 0) {
      return gym.photos[0].url;
    }
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMiIvPjwvZz48L3N2Zz4=')]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Transform Your</span>
              <span className="block mt-1 text-white">Gym Management</span>
            </h1>
            <p className="mt-6 max-w-md mx-auto text-base sm:text-lg md:mt-8 md:text-xl md:max-w-3xl">
              Streamline your gym operations, engage with members, and grow your
              business with our comprehensive management platform.
            </p>
            <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10 gap-4">
              <div className="rounded-xl shadow-md shadow-primary-800/20 mb-4 sm:mb-0">
                <Link
                  to="/signup"
                  className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-primary-700 bg-white hover:bg-gray-50 hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
              <div className="rounded-xl shadow-md shadow-primary-800/20">
                <Link
                  to="/explore-gyms"
                  className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Explore Gyms
                </Link>
              </div>
            </div>
          </div>

          {/* Moving triangle decorations */}
          <div className="hidden lg:block absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/4 opacity-25">
            <div className="w-64 h-64 border-4 border-white rounded-3xl transform rotate-45"></div>
          </div>
          <div className="hidden lg:block absolute top-0 left-0 transform -translate-y-1/2 -translate-x-1/4 opacity-25">
            <div className="w-48 h-48 border-4 border-white rounded-3xl transform rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Featured Gyms Showcase */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold mr-2 px-3 py-1 rounded-full">
              FEATURED
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Featured Fitness Centers
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our handpicked selection of premier gyms offering
              exceptional facilities and services.
            </p>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : featuredError ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <p className="text-gray-600">{featuredError}</p>
            </div>
          ) : featuredGyms.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-gray-500">
                No featured gyms available at the moment.
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredGyms.map((gym) => (
                  <Link
                    to={`/gyms/${gym._id}`}
                    key={gym._id}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getGymThumbnail(gym)}
                        alt={gym.gymName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-0 right-0 mt-3 mr-3">
                        <span className="flex items-center bg-primary-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                          <FaStar size={10} />
                          <span>Featured</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-5">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                        {gym.gymName}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 flex items-center">
                        <FaMapMarkerAlt size={10} />
                        {gym.address.city}, {gym.address.state}
                      </p>
                      <p className="mt-3 text-gray-600 line-clamp-2 text-sm">
                        {gym.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {gym.services?.slice(0, 3).map((service, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
                          >
                            {service.name}
                          </span>
                        ))}
                        {gym.services?.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            +{gym.services.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 pt-0 mt-auto">
                      <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-800">
                        View Details <FaArrowRight size={10} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-12 text-center">
                <Link
                  to="/explore-gyms"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Explore All Gyms
                  <FaArrowRight size={10} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regular Gyms Section - KEEP THE EXISTING CODE */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full mb-3">
              Popular Gyms
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Top Rated Fitness Centers
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Discover premier fitness facilities that have been verified and
              approved by our team.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center mt-12">
              <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 border-opacity-50 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : error ? (
            <div className="mt-12 bg-red-50 text-red-600 p-4 rounded-xl text-center">
              {error}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {activeGyms && activeGyms.length > 0 ? (
                activeGyms.slice(0, 6).map((gym) => (
                  <div
                    key={gym._id}
                    className="bg-white overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 overflow-hidden">
                      {gym.photos && gym.photos.length > 0 ? (
                        <img
                          src={gym.photos[0].url}
                          alt={gym.gymName}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <p className="text-gray-400">No image available</p>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {gym.gymName}
                          </h3>
                          {/* Rating display */}
                          <div className="flex items-center">
                            <span className="text-amber-500">★</span>
                            <span className="ml-1 text-sm text-gray-600">
                              {gym.rating || "4.5"}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {gym.address?.city}, {gym.address?.state}
                        </p>
                        <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                          {gym.description}
                        </p>

                        {gym.services && gym.services.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                              Services
                            </h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {gym.services
                                .slice(0, 3)
                                .map((service, index) => (
                                  <span
                                    key={index}
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
                        )}
                      </div>

                      <div className="mt-6">
                        <Link
                          to={`/explore/${gym._id}`}
                          className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                        >
                          Explore Gym
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-xl font-medium text-gray-900 mb-1">
                    No gyms found
                  </p>
                  <p className="text-gray-500">
                    Check back later for newly approved gyms.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Shop
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Featured Products
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Quality fitness equipment and supplements to help you achieve your
              goals.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 mt-8">{error}</div>
          ) : (
            <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.length > 0 ? (
                featuredProducts.slice(0, 8).map((product) => (
                  <div
                    key={product._id}
                    className="group relative bg-white rounded-lg shadow overflow-hidden"
                  >
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200 w-full overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-center object-cover group-hover:opacity-75"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-200">
                          <p className="text-gray-400">No image available</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.category}
                      </p>
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-lg font-medium text-gray-900">
                          ${product.price.toFixed(2)}
                        </p>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            product.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Link
                          to={`/member/shop/product/${product._id}`}
                          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">
                    No featured products found at the moment.
                  </p>
                </div>
              )}
            </div>
          )}

          {featuredProducts.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                to="/member/shop"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for your fitness journey
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Find Local Gyms
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Discover approved gyms in your area with detailed information
                  about their facilities and services.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Personalized Fitness
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Get workout plans, diet guidance, and progress tracking
                  tailored to your fitness goals.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Shop Premium Products
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Browse and purchase quality fitness equipment, supplements,
                  and apparel from our curated selection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
