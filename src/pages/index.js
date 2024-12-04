import axios from 'axios';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useState, useEffect} from "react";

export async function getStaticProps() {
    try {
        const res = await axios.get('https://www.themealdb.com/api/json/v1/1/search.php?s=');
        const recipes = res.data.meals || [];

        return {
            props: {
                recipes,
            },
            revalidate: 10,
        };
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return {
            props: {
                recipes: [],
            },
        };
    }
}

export default function Home({recipes}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [tabController, setTabController] = useState(0);
    const [favorites, setFavorites] = useState([]);

    // Fetch favorite meals from the server
    const fetchFavorites = async () => {
        try {
            const res = await axios.get('/api/favorites');
            setFavorites(res.data); // Set favorite meals state
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    useEffect(() => {
        if (tabController === 1) {
            fetchFavorites();
        }
    }, [tabController]);

    useEffect(() => {
        const handleStart = () => setIsLoading(true); // When navigation starts
        const handleComplete = () => setIsLoading(false); // When navigation ends

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router]);

    // Show a loading state when fallback is in progress
    if (router.isFallback || isLoading) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin mb-4 mx-auto"></div>
                    <p>Loading meal details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto p-6">
                <div className="flex items-center mb-6 border-b border-gray-700 relative">
                    <h1 className="text-2xl font-bold pb-2 cursor-pointer w-6/12 text-center"
                        onClick={() => setTabController(0)}>
                        All Meals
                    </h1>
                    <h1 className="text-2xl font-bold pb-2 cursor-pointer w-6/12 text-center"
                        onClick={() => setTabController(1)}>
                        Favorite Meals
                    </h1>
                    <div
                        className={`w-6/12 absolute h-1 bg-amber-100 bottom-0 rounded ${tabController === 0 ? "left-0" : "left-1/2"} transition-all`}
                    />
                </div>

                {tabController === 0 ? (
                    <div className="grid grid-cols-4 gap-6">
                        {recipes.length > 0 ? (
                            recipes.map((recipe) => (
                                <div key={recipe.idMeal} className="relative">
                                    <Link href={`/recipe/${recipe.idMeal}`}>
                                        <div
                                            className="block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition transform duration-200">
                                            <img
                                                src={recipe.strMealThumb}
                                                alt={recipe.strMeal}
                                                className="w-full h-40 object-cover"
                                            />
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold truncate">{recipe.strMeal}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-4 text-center">No recipes found.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-6">
                        {favorites.length > 0 ? (
                            favorites.map((favorite) => (
                                <div key={favorite.mealId} className="relative">
                                    <Link href={`/recipe/${favorite.mealId}`}>
                                        <div
                                            className="block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition transform duration-200">
                                            <img
                                                src={favorite.imageUrl}
                                                alt={favorite.mealName}
                                                className="w-full h-40 object-cover"
                                            />
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold truncate">{favorite.mealName}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-4 text-center">No favorite meals yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
