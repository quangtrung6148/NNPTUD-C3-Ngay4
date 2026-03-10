var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products');
const { default: slugify } = require('slugify');

/* GET all products */
router.get('/', async function(req, res, next) {
  try {
    let result = await productModel.find({ isDeleted: false });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/* GET product by ID */
router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.findOne({
      isDeleted: false,
      _id: id
    });
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

/* POST - Create new product */
router.post('/', async function(req, res, next) {
  try {
    let newProduct = new productModel({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
      }),
      price: req.body.price || 0,
      description: req.body.description || "",
      images: req.body.images || ["https://i.imgur.com/ZANVnHE.jpeg"],
      category: req.body.category || null
    });
    await newProduct.save();
    res.status(201).send(newProduct);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

/* PUT - Update product */
router.put('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let updateData = { ...req.body };
    
    // Auto update slug if title is changed
    if (req.body.title) {
      updateData.slug = slugify(req.body.title, {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
      });
    }
    
    let updatedItem = await productModel.findByIdAndUpdate(id, updateData, {
      new: true
    });
    
    if (!updatedItem) {
      res.status(404).send({ message: "Product not found" });
    } else {
      res.send(updatedItem);
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

/* DELETE - Soft delete product */
router.delete('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await productModel.findByIdAndUpdate(id, {
      isDeleted: true
    }, {
      new: true
    });
    
    if (!updatedItem) {
      res.status(404).send({ message: "Product not found" });
    } else {
      res.send({ message: "Product deleted successfully", data: updatedItem });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
