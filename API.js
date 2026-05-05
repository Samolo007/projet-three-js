const API_key = "5854f365";
export async function getMovieInfo(title) {
    const response = await fetch(`http://www.omdbapi.com/?t=${title}&apikey=${API_key}&plot=full`);
    const data = await response.json();
if (data.Response === "False") {
    console.error(`film introuvable:`, data.Error);
    return null;
    }
    return data;
}