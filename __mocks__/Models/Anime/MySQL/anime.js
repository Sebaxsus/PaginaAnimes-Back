export const getAllAnimes = async () => ({
    data: [
        { id: 'anime-id', title: 'Mock Anime', genre: [1], desc: 'Descripción', img: 'http://anime.jpg' }
    ],
    pagination: {
        currentPage: 1,
        pageSize: 6,
        totalPages: 4,
        totalRows: 24,
        hasNext: true,
        hasPrevius: false,
    },
});

export const getAnimeById = async (id) => (
id === 'anime-id'
    ? { id, title: 'Mock Anime', genre: [1], desc: 'Descripción', img: 'http://anime.jpg' }
    : null
);

export const createAnime = async (data) => ({
id: 'new-anime-id',
...data,
});

export const updateAnime = async (id, data) => ({
id,
...data,
});

export const deleteAnime = async (id) => ({
id,
deleted: true,
});
  