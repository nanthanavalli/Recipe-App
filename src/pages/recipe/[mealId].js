import axios from 'axios';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useState, useEffect, useLayoutEffect} from 'react';
import {FiArrowLeft} from 'react-icons/fi';
import {FaRegStar, FaStar} from "react-icons/fa";
import {toast} from "react-toastify";

export async function getStaticPaths() {
    try {
        const res = await axios.get('https://www.themealdb.com/api/json/v1/1/search.php?s=');
        const recipes = res.data.meals || [];

        const paths = recipes.map((recipe) => ({
            params: {mealId: recipe.idMeal},
        }));

        return {
            paths,
            fallback: true,
        };
    } catch (error) {
        console.error('Error fetching paths:', error);
        return {
            paths: [],
            fallback: true,
        };
    }
}

export async function getStaticProps({params}) {
    const {mealId} = params;

    try {
        const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const meal = res.data.meals ? res.data.meals[0] : null;

        if (!meal) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                meal,
            },
            revalidate: 10,
        };
    } catch (error) {
        console.error('Error fetching meal details:', error);
        return {
            notFound: true,
        };
    }
}

export default function RecipeDetail({meal}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleComplete = () => setIsLoading(false);

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router]);

    useLayoutEffect(() => {
        const fetchFavorites = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get('/api/favorites');
                setIsLoading(false);
                setFavorites(res.data);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };
        fetchFavorites();
    }, []);


    const handleRemoveFavorite = async (mealId) => {
        try {
            const response = await axios.delete('/api/favorites', {
                data: {
                    mealId: mealId
                }
            });
            if (response.data.message === 'Meal removed from favorites') {
                setFavorites((prev) => prev.filter((meal) => meal.mealId !== mealId));
            }
            toast(response.data.message);
        } catch (error) {
            console.error('Error removing favorite meal:', error);
        }
    };

    const handleAddFavorite = async () => {
        try {
            const response = await axios.post('/api/favorites', {
                mealId: meal.idMeal,
                mealName: meal.strMeal,
                imageUrl: meal.strMealThumb,
            });
            if (response.data.message === 'Meal added to favorites') {
                setFavorites((prev) => [...prev, {...meal, mealId: meal.idMeal}]);
            }
            toast(response.data.message);
        } catch (error) {
            console.error('Error adding favorite meal:', error);
        }
    };

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

    if (!meal) {
        return <div className="text-center text-white">Meal not found.</div>;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto p-6">
                <Link href="/">
                    <div
                        className="flex items-center text-blue-500 hover:text-blue-700 font-semibold mb-6 cursor-pointer">
                        <FiArrowLeft className="mr-2"/>
                        <span>Back to All Meals</span>
                    </div>
                </Link>

                <div className="grid grid-cols-2 gap-6">
                    <div className="">
                        <img
                            src={meal.strMealThumb}
                            alt={meal.strMeal}
                            className="w-full rounded-lg shadow-lg sticky top-10"
                        />
                    </div>

                    <div>
                        <div className="flex items-center mb-4 gap-3">
                            <h1 className="text-3xl font-bold">{meal.strMeal}</h1>
                            {favorites.some(favorite => favorite.mealId === meal.idMeal) ?
                                <FaStar size={24} onClick={() => {
                                    handleRemoveFavorite(meal.idMeal);
                                }}/> :
                                <FaRegStar size={24} onClick={handleAddFavorite}/>}
                        </div>
                        <p className="text-gray-400 mb-4">
                            <span className="font-semibold">Category:</span> {meal.strCategory}
                        </p>
                        <p className="text-gray-400 mb-4">
                            <span className="font-semibold">Area:</span> {meal.strArea}
                        </p>
                        <p className="mb-4" style={{whiteSpace: 'pre-line'}}>
                            {meal.strInstructions}
                        </p>

                        <h2 className="text-xl font-semibold mb-2">Ingredients:</h2>
                        <ul className="list-disc list-inside">
                            {Array.from({length: 20}, (_, i) => i + 1).map((num) => {
                                const ingredient = meal[`strIngredient${num}`];
                                const measure = meal[`strMeasure${num}`];
                                return (
                                    ingredient && (
                                        <li key={num}>
                                            {measure} {ingredient}
                                        </li>
                                    )
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
