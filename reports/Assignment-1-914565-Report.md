# 1 Introduction

This is the first assignment in which our assumption is that you (the student doing this assignment) design a simple big data platform. The big data platform to be designed will have a set of minimum features built from some key components. We assume that you do not have depth knowledge about some technologies to be used in the design of your big data platform but this will not prevent you to design and run a simple big data platform.

# 2 Constraints and inputs for the assignment  
The simple big data platform to be designed and developed, called **mysimbdp**, will have the following key components:

- a key component to ***store and manage data*** called **mysimbdp-coredms**. This component is a platform-as-a-service.  
- a key component, called **mysimbdp-daas**, of ***which APIs can be called by external data producers/consumers to store/read data into/from mysimbdp-coredms***. This component is a platform-as-a-service.  
- a key component, called **mysimbdp-dataingest**, to ***read data from data sources (files/external databases/messaging systems) of the tenant/customer and then store the data by calling APIs of mysimbdp-coredms.***

A platform can be used by a set of tenants. One tenant can run many data producers/consumers, whereas each producer and consumer might use a set of concurrent tasks for writing and reading data. In this assignment we do not focus on specific requirements from tenants by assuming that the tenants of mysimbdp have data using similar data models.

# 3 Requirements and delivery

The deliverable of this assignment includes three parts

## Part 1 - Design (weighted factor for grades = 2)

 **1. Explain your choice of data and technologies for mysimbdp-coredms (1 point)**

  As a student from BIZ school, I chose the dateset of Airbnb, I need to analyze the market demand and provide insights for decision making in some researchs and some other assignments, so Airbnb dataset could be a good example.

  Speaking of technology, I chose MongoDB as the Database and employed  MongoDB across AWS in MongoDB Atlas. MongoDB is non-relational database, or NoSQL database, because the Airbnb dataset is also non-relational types, so I chose MongoDB as the database.

 **2.  Design and explain interactions between main components in your architecture of mysimbdp (1 point)**

   **mysimbdp-coredms:** Store and manage data, including MongoDB and MongoDB Atlas.

  **mysimbdp-daas:** APIs can be called by external data producers/consumers to store/read data into/from mysimbdp-coredms.

  **mysimbdp-dataingest:** Read data from data sources (files/ external databases/ messaging systems) of the tenant/customer and then store the data by calling APIs of mysimbdp-coredms.

 **3.  Explain a configuration of a cluster of nodes for mysimbdp-coredms so that you do not have a single-point-of-failure problem for mysimbdp-coredms for your tenants (1 point)**

 I have three nodes in MongoDB cluster. Because replica set has at least 3 ndoes by default. Replication provides redundancy and increases data availability. With multiple copies of data on different database servers, replication provides a level of fault tolerance against the loss of a single database server.

 **4.  You decide a pre-defined level of data replication for your tenants/customers. Explain how many nodes are needed in the deployment of mysimbdp-coredms for your choice so that this component can work property (e.g., the system still supports redundancy in the case of a failure of a node) (1 point)**

  At least 3 nodes, because replica set has at least 3 ndoes in MongoDB by default. A replica set contains several data bearing nodes and optionally one arbiter node. Of the data bearing nodes, one and only one member is deemed the primary node, while the other nodes are deemed secondary nodes.

  The primary records all changes to its data sets. The secondaries replicate the primary’s oplog and apply the operations to their data sets such that the secondaries’ data sets reflect the primary’s data set. If the primary is unavailable, an eligible secondary will hold an election to elect itself the new primary.

 **5.  Explain how would you scale mysimbdp to allow many tenants using mysimbdp-dataingest to push data into mysimbdp (1 point)**

A platform can be used by a set of tenants. One tenant can run many data producers/consumers, whereas each producer and consumer might use a set of concurrent tasks for writing and reading data. So I'd like to build RESTful APIs for users to call in order to read and store the data concurrently.

## Part 2 - Implementation (weighted factor for grades = 2)

**1.  Design, implement and explain the data schema/structure for mysimbdp-coredms (1 point)**

There's two collections in my mongoDB cluster, reviews and listings. So I created  schema based on their property for each.

The schema of review:

    const reviewSchema = {
      listing_id: Number,
      id: Number,
      date: Date,
      reviewer_id: Number,
      reviewer_name: String,
      comments: String
    }


The schema of listing(room):

    const listingSchema = {
      id: Number,
      name: String,
      host_id: Number,
      neighbourhood_group: String,
      neighbourhood: String,
      latitude: Number,
      longitude: Number,
      room_type: String,
      price: Number,
      minimum_nights: Number,
      number_of_reviews: Number,
      last_review: Date,
      reviews_per_month: Number,
      calculated_host_listings_count: Number,
      availability_365: Number
    }


**2.  Design a strategy for data partitioning/sharding and explain your implementation for data partitioning/sharding together with your design for replication in Part 1, Point 4, in mysimbdp-coredms (1 point)**

A distributed SQL database needs to automatically partition the data in a table and distribute it across nodes. Distributed caches have had to distribute data across multiple nodes for a while. The database we used is mongoDB, MongoDB uses the shard keyassociated to the collection to partition the data into chunks. A chunk consists of a subset of sharded data. Each chunk has a inclusive lower and exclusive upper range based on the shard key. And MongoDB splits chunks when they grow beyond the configured chunk size. Both inserts and updates can trigger a chunk split. As a result, we don't need to splits chunk manually. But the default chunk size in MongoDB is only 64 megabytes. I can increase or reduce the chunk size if I wish to.

**3.  Write a mysimbdp-dataingest that takes data from your selected sources and stores the data into mysimbdp-coredms. Explain possible consistency options for writing data in your mysimdbp-dataingest (1 point)**

For example, if I want to ingest data from reviews.csv, I can run code below:



    const reviews = [];

    fs.createReadStream("../data/reviews.csv")
      .pipe(csv({}))
      .on("data", (data) => reviews.push(data))
      .on("end", () => {
        console.log(reviews);
      });

    mongodb.connect(
      "mongodb+srv://admin-liyuan:rice1128@cluster0.dcods.mongodb.net/BDP?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      (err, client) => {
        if (err) throw err;
        client
          .db("airbnb")
          .collection("reviews")
          .insertMany(reviews, (err, res) => {
            if (err) throw err;
            console.log(`Inserted: ${res.insertedCount} rows`);
            client.close();
          });
      }
    );


**4.  Given your deployment environment, show the performance (response time and failure) of the tests for 1,5, 10, .., n of concurrent mysimbdp-dataingest writing data into mysimbdp-coredms with different speeds/velocities. Indicate any performance differences due to the choice of consistency options (1 point)**

in progress.    

 **5. Observing the performance and failure problems when you push a lot of data into mysimbdp-coredms (you do not need to worry about duplicated data in mysimbdp), propose the change of your deployment to avoid such problems (or explain why you do not have any problem with your deployment) (1 point)**

  in progress.   


## Part 3 Extension (weighted factor for grades = 1)

**1.  Using your mysimdbp-coredms, a single tenant can create many different databases/datasets. Assume that you want to support the tenant to manage metadata about the databases/datasets, what would be your solution? (1 point)**

I'd like to use Mongoose and create schema for each object (such as review and listing) so that users could manage data by keys and values.

For example, if the user want to insert data to database:


      app.post("/airbnb/ingest", function(req, res) {
      const newReview = new Review({
        listing_id: req.body.listing_id,
        id: req.body.id,
        date: req.body.date,
        reviewer_id: req.body.reviewer_id,
        reviewer_name: req.body.reviewer_name,
        comments: req.body.comments
      });
      newReview.save(function(err) {
        if (!err) {
          res.send("Successfully added a new review!");
        } else {
          res.send(err);
        }
      });
    })

**2.  Assume that each of your tenants/users will need a dedicated mysimbdp-coredms. Design the data schema of service information for mysimbdp-coredms that can be published into an existing registry (like ZooKeeper, consul or etcd) so that you can find information about which mysimbdp-coredms is for which tenants/users (1 point)**



**3.  Explain how you would change the implementation of mysimbdp-dataingest (in Part 2) to integrate a service discovery feature (no implementation is required) (1 point)**



**4.  Assume that now only mysimbdp-daas can read and write data into mysimbdp-coredms, how would you change your mysimbdp-dataingest (in Part 2) to work with mysimbdp-daas? (1 point)**



**5.  Assume that you design APIs for mysimbdp-daas so that any other developer who wants to implement mysimbdp- dataingest can write his/her own ingestion program to write the data into mysimbdp-coredms by calling mysimbdp-daas. Explain how would you control the data volume and speed in writing and reading operations for a tenant? (1 point)**


# 4 Other notes  
Remember that we need to reproduce your work. Thus:

Include git logs to show that you have incrementally solved questions in the assignment
