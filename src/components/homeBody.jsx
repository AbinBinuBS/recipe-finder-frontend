import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../redux/userSlice';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';
import userApiClient from '../services/userApiClient';

const HomeBody = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const pageSize = 6;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchQuery(value);
      setCurrentPage(1);
    }, 500), 
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value); 
    debouncedSetSearch(value); 
  };

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  useEffect(() => {
    if (user && user.liked) {
      const initialLikedState = {};
      user.liked.forEach(id => {
        initialLikedState[id] = true;
      });
      setLikedRecipes(initialLikedState);
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(clearTokens());
    navigate('/');
  };

  const handleWishlist = () => {
    navigate('/liked');
  };

  useEffect(() => {
    fetchRecipes();
  }, [debouncedSearchQuery, currentPage]); 

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await userApiClient.get(`/api/recipes?page=${currentPage}&pageSize=${pageSize}&search=${debouncedSearchQuery}`);
      const adaptedRecipes = response.data.recipes.results.map(recipe => ({
        id: recipe.id.toString(),
        name: recipe.title,
        image: recipe.image
      }));
      setRecipes(adaptedRecipes);
      
      const total = response.data.recipes.totalResults;
      setTotalRecipes(total);
      setTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (recipeId) => {
    navigate(`/recipeDetails/${recipeId}`);
  };

  const toggleLike = async (recipe) => {
    try {
      const response = await userApiClient.post('/api/addLike', recipe);
      if(response.data.message === "Item added to liked items."){
        toast.success("Item added to liked items.")
      }else if(response.data.message === "Item already exist."){
        toast.error("Item already exist.")
      }
      setLikedRecipes(prev => ({
        ...prev,
        [recipe.id]: !prev[recipe.id]
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update wishlist. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Delicious Recipes
          </h1>
          <div className="flex flex-wrap w-full sm:w-auto gap-2">
            <button
              onClick={handleWishlist}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>Wishlist</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
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
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 backdrop-blur-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300"
                >
                  <div className="relative">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-semibold">{recipe.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold">{recipe.name}</h3>
                      <button 
                        onClick={() => handleView(recipe.id)}
                        className="px-3 py-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm rounded-full"
                      >
                        View
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-orange-100 pt-4">
                      <button 
                        onClick={() => toggleLike(recipe)}
                        className="px-3 py-1 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recipes.length === 0 ? (
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
                    d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No recipes found</h3>
                <p className="text-gray-500">Try adjusting your search</p>
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center space-y-4">
                <div className="flex flex-wrap justify-center items-center gap-2">
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
                  
                  <div className="flex items-center gap-2">
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
                            className={`w-10 h-10 rounded-lg ${
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

export default HomeBody;