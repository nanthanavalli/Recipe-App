import axios from 'axios';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useEffect, useState} from "react";


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

    if (router.isFallback || isLoading) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin mb-4 mx-auto"></div>
                    <p>Loading meal details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold pb-2">All Meals</h1>
                    <h2 className="text-lg pb-2 text-gray-400">Favorite Meals</h2>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {recipes.length > 0 ? (
                        recipes.map((recipe) => (
                            <Link href={`/recipe/${recipe.idMeal}`} key={recipe.idMeal}>
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
                        ))
                    ) : (
                        <p className="col-span-4 text-center">No recipes found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
