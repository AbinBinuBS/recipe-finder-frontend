import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../redux/userSlice';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Search, Home } from 'lucide-react';
import userApiClient from '../services/userApiClient';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

const LikedBody = ({ user }) => {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalRecipes, setTotalRecipes] = useState(0);
  const pageSize = 6;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchLikedRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userApiClient.get('/api/getLikedRecipes', {
        params: {
          page: currentPage,
          pageSize,
          search: debouncedSearchQuery
        }
      });
      const { recipes, total, totalPages: pages } = response.data;
      setLikedRecipes(recipes);
      setTotalRecipes(total);
      setTotalPages(pages);
    } catch (error) {
      console.error('Error fetching liked recipes:', error);
      toast.error('Failed to fetch liked recipes');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, pageSize]);

  useEffect(() => {
    fetchLikedRecipes();
  }, [fetchLikedRecipes]);

  const handleLogout = () => {
    dispatch(clearTokens());
    navigate('/');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (recipeId) => {
    navigate(`/recipeDetails/${recipeId}`);
  };

  const handleUnlike = async (recipe) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This recipe will be removed from your favorites!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ea580c',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, remove it!',
        background: '#fff',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          confirmButton: 'rounded-lg',
          cancelButton: 'rounded-lg'
        }
      });
      if (result.isConfirmed) {
        await userApiClient.post('/api/removeLike', {
          id: recipe._id 
        });
        toast.success('Recipe removed from favorites');
        await fetchLikedRecipes();
      }
    } catch (error) {
      console.error('Error removing recipe:', error);
      toast.error(error.response?.data?.message || 'Failed to remove recipe');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const isSearching = searchQuery !== debouncedSearchQuery;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHome}
              className="p-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              aria-label="Go to home"
            >
              <Home size={24} />
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Favorite Recipes
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search your favorite recipes..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <Search 
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isSearching ? 'text-orange-500 animate-pulse' : 'text-gray-400'
            }`} 
            size={20} 
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {likedRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300"
                >
                  <div className="relative">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-semibold line-clamp-2">{recipe.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold line-clamp-2">{recipe.name}</h3>
                      <button 
                        onClick={() => handleView(recipe.itemId)}
                        className="px-3 py-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm rounded-full flex-shrink-0"
                      >
                        View
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-orange-100 pt-4">
                      <button 
                        onClick={() => handleUnlike(recipe)}
                        className="px-3 py-1 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {likedRecipes.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-orange-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">
                  {searchQuery ? 'No recipes found matching your search' : 'No favorite recipes yet'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try a different search term' : 'Start adding recipes to your favorites!'}
                </p>
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-white hover:bg-orange-50 text-gray-700 border border-orange-200'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const distance = Math.abs(page - currentPage);
                        return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                                : 'bg-white hover:bg-orange-50 text-gray-700 border border-orange-200'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-white hover:bg-orange-50 text-gray-700 border border-orange-200'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <p className="text-gray-600 text-center">
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalRecipes)} of {totalRecipes} recipes
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LikedBody;