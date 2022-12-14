const db = require('../models');

exports.getAlbums = () => {
    return db.albums.findAll();
}

exports.getAlbumById = (albumId) => {
    return db.albums.findAll({
        where: {
            albumId
        }
    });
}

exports.addAlbum = (albumName, author, realeaseDate) => {
    return db.albums.create({albumName, author, realeaseDate});
}

exports.updateAlbum = (albumId,albumName, author, realeaseDate) => {
    return db.albums.update(
        {
            albumName: albumName,
            author: author,
            realeaseDate : realeaseDate,
        },{
            where: { albumId: albumId },
        }
      );
}

exports.deleteAlbumById = (albumId) => {
    return db.albums.destroy({
        where: {
            albumId
        }
    });
}