const express = require('express');
const multer = require('multer');
const minioClient = require('../package/minio');
const FileNode = require('../models/FileNode');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Buat folder baru
router.post('/folder', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const parent = parentId ? await FileNode.findById(parentId) : null;
    const path = parent ? `${parent.path}/${name}` : `/${name}`;

    const folder = new FileNode({ name, type: 'folder', parent: parentId || null, path });
    await folder.save();
    res.json(folder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload file ke folder tertentu
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    const { parentId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'File is required' });

    const parent = parentId ? await FileNode.findById(parentId) : null;
    const path = parent ? `${parent.path}/${req.file.originalname}` : `/${req.file.originalname}`;

    // Simpan file ke MinIO
    const objectName = `${Date.now()}_${req.file.originalname}`;
    await minioClient.putObject('filemanager', objectName, req.file.buffer);

    // Simpan metadata file di MongoDB
    const file = new FileNode({
      name: req.file.originalname,
      type: 'file',
      parent: parentId || null,
      path,
      minioObjectName: objectName,
    });
    await file.save();

    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List isi folder (file + folder)
router.get('/list/:parentId?', async (req, res) => {
  try {
    const parentId = req.params.parentId || null;
    const items = await FileNode.find({ parent: parentId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download file by ID
router.get('/download/:id', async (req, res) => {
  try {
    const fileNode = await FileNode.findById(req.params.id);
    if (!fileNode || fileNode.type !== 'file')
      return res.status(404).json({ error: 'File not found' });

    const stream = await minioClient.getObject('filemanager', fileNode.minioObjectName);
    res.attachment(fileNode.name);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const deleteSubtree = async (id) => {
  const node = await FileNode.findById(id);
  if (!node) return;

  if (node.type === 'folder') {
    // Cari semua anak
    const children = await FileNode.find({ parent: node._id });
    // Hapus rekursif semua anak
    for (const child of children) {
      await deleteSubtree(child._id);
    }
  } else if (node.type === 'file' && node.minioObjectName) {
    // Hapus file dari MinIO
    try {
      await minioClient.removeObject('your-bucket', node.minioObjectName);
    } catch (err) {
      console.error('MinIO delete error:', err);
    }
  }

  // Hapus node di MongoDB
  await FileNode.deleteOne({ _id: id });
};

router.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const node = await FileNode.findById(id);
    if (!node) return res.status(404).json({ error: 'Node not found' });

    await deleteSubtree(id);

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ganti nama file/folder
router.put('/rename/:id', async (req, res) => {
  try {
    const { newName } = req.body;
    const id = req.params.id;
    const node = await FileNode.findById(id);
    if (!node) return res.status(404).json({ error: 'Node not found' });

    // Update path untuk node dan semua anak jika folder
    const oldPath = node.path;
    let newPath;
    if (node.parent) {
      const parent = await FileNode.findById(node.parent);
      newPath = `${parent.path}/${newName}`;
    } else {
      newPath = `/${newName}`;
    }

    // Update node utama
    node.name = newName;
    node.path = newPath;
    await node.save();

    // Jika folder, update path semua anak
    if (node.type === 'folder') {
      const updateChildrenPath = async (parentNode) => {
        const children = await FileNode.find({ parent: parentNode._id });
        for (const child of children) {
          // Ganti path child
          child.path = child.path.replace(oldPath, newPath);
          await child.save();
          if (child.type === 'folder') {
            await updateChildrenPath(child);
          }
        }
      };
      await updateChildrenPath(node);
    }

    res.json({ message: 'Renamed successfully', node });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
