import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Star, ArrowLeft } from 'lucide-react';
import userApiClient from '../services/userApiClient';

const RecipeDetailsBody = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);

    useEffect(() => {
        fetchRecipeDetails();
    }, [recipeId]);

    const fetchRecipeDetails = async () => {
        try {
            const response = await userApiClient.get(`/api/recipes/getRecipeDetails/${recipeId}`);
            setRecipe(response.data);
        } catch (error) {
            console.error("Error fetching recipe details:", error);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (!recipe) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-pulse text-2xl text-gray-500">Loading Recipe...</div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-white to-gray-100 min-h-screen py-4 sm:py-8">
            <div className="container mx-auto px-6 sm:px-4 max-w-6xl">
                {/* Back Button */}
                <button 
                    onClick={handleGoBack}
                    className="flex items-center mb-4 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span>Back to recipes</span>
                </button>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6">
                        <div className="flex flex-col md:flex-row md:items-center">
                            <div className="w-full md:w-1/3 mb-6 md:mb-0">
                                <img 
                                    src={recipe.image} 
                                    alt={recipe.title} 
                                    className="w-full h-48 sm:h-72 object-cover rounded-xl shadow-lg transform transition hover:scale-105"
                                />
                            </div>

                            <div className="w-full md:w-2/3 md:pl-8">
                                <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight pr-4">{recipe.title}</h1>
                                
                                <div className="grid grid-cols-3 gap-3 sm:gap-4 pr-4">
                                    {[
                                        { icon: Clock, label: 'Time', value: `${recipe.readyInMinutes} mins` },
                                        { icon: Users, label: 'Servings', value: recipe.servings },
                                        { icon: Star, label: 'Score', value: `${recipe.spoonacularScore.toFixed(0)}%` }
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="bg-white/70 p-3 rounded-lg shadow-md text-center">
                                            <div className="flex justify-center mb-1 sm:mb-2">
                                                <Icon className="text-orange-500 w-4 h-4 sm:w-6 sm:h-6" />
                                            </div>
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600">{label}</p>
                                            <p className="text-sm sm:text-lg font-bold text-gray-800">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pr-4">
                                    <h3 className="font-bold text-gray-700 mb-3">Dish Types</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.dishTypes.map((type) => (
                                            <span 
                                                key={type} 
                                                className="bg-blue-100 text-blue-800 px-3 py-1 text-xs sm:text-sm rounded-full transition hover:bg-blue-200"
                                            >
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="pr-4">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Ingredients</h2>
                                <div className="max-h-80 sm:max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                    <ul className="divide-y divide-gray-200">
                                        {recipe.extendedIngredients.map((ingredient) => (
                                            <li 
                                                key={ingredient.id} 
                                                className="px-4 py-3 hover:bg-gray-50 transition text-sm sm:text-base"
                                            >
                                                <span className="text-gray-700">{ingredient.original}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="pr-4">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">About This Recipe</h2>
                                <div 
                                    className="text-sm sm:text-base text-gray-600 mb-6 prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: recipe.summary }}
                                />

                                {recipe.winePairing && (
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Wine Pairing</h3>
                                        <p className="text-sm sm:text-base text-gray-600 mb-3 italic">{recipe.winePairing.pairingText}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {recipe.winePairing.pairedWines.map((wine) => (
                                                <span 
                                                    key={wine} 
                                                    className="bg-green-100 text-green-800 px-3 py-1 text-xs sm:text-sm rounded-full transition hover:bg-green-200"
                                                >
                                                    {wine}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailsBody;