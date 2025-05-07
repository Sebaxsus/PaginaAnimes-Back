export const getAllMangas = async () => ({
    data: [
        { id: 'mock-id', title: 'Mock Manga', genre: [1], desc: 'Mock desc', img: 'http://image.jpg' }
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

export const getMangaById = async (id) => (
  id === 'mock-id'
    ? { id, title: 'Mock Manga', genre: [1], desc: 'Mock desc', img: 'http://image.jpg' }
    : null
);

export const createManga = async (data) => ({
  id: 'new-mock-id',
  ...data,
});

export const updateManga = async (id, data) => ({
  id,
  ...data,
});

export const deleteManga = async (id) => ({
  id,
  deleted: true,
});
