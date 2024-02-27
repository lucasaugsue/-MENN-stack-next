const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

// const uri = process.env.MONGODB_URI;
const uri = "mongodb+srv://lucasaugsue:123*node*123@menn-stack-mongodb.ev4khmb.mongodb.net/?retryWrites=true&w=majority&appName=menn-stack-mongodb";

let collection;

async function connectToMongoDB() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  await client.connect();

  const database = client.db("menn-stack-mongodb");
  collection = database.collection("users");

  console.log("Connected to MongoDB and 'users' collection created.");

  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

connectToMongoDB().catch(console.dir);

router.post('/create', async function(req, res, next) {
  try {
    // Verificar se a coleção está definida
    if (!collection) {
      console.log("A coleção não está definida.");
      return res.status(500).json({ error: 'Falha ao inserir usuário.' });
    }

    const { nome } = req.body;

    // Utilizando o método insertOne e capturando o resultado
    const result = await collection.insertOne({ nome });

    // Verificando se houve uma inserção bem-sucedida
    if (result.acknowledged) {
      res.status(201).json({
        id: result.insertedId,
        nome: nome, // Usando o nome diretamente da requisição, pois não é garantido que result.ops[0] exista
      });
    } else {
      res.status(500).json({ error: 'Falha ao inserir usuário.' });
    }
  } catch (err) {
    // Imprimir detalhes do erro no console
    console.error("Erro durante a inserção:", err);
    res.status(500).json({ error: 'Falha ao inserir usuário.' });
  }
});

router.get('/list', async function(req, res, next) {
  try {
    const users = await collection.find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/get-by-id/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await collection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/edit/:id', async function(req, res, next) {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    const result = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { nome } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Usuário editado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete/:id', async function(req, res, next) {
  try {
    const { id } = req.params;

    const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Usuário deletado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
