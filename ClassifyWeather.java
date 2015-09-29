/**
 * ClassifyWeather.java
 * 
 * A program to classify the weather class attribute of a given testing instance based on given training instances
 * 
 * @usage ClassifyWeather <Attribute> <ELEVATION> <LATITUDE> <LONGITUDE> <MONTH>
 * @output
 * <Output Class>
 * <Accuracy>
 * 
 * @author Jaydeep Untwal, Shubham Saxena, Harsh Sadvani
 */

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.PrintStream;

import weka.classifiers.Classifier;
import weka.classifiers.Evaluation;
import weka.classifiers.trees.J48;
import weka.core.Attribute;
import weka.core.FastVector;
import weka.core.Instance;
import weka.core.Instances;
import weka.core.converters.CSVLoader;

/*
 * Classify Weather
 */
public class ClassifyWeather {
	static Instances testingInstances = null;
	static Instances WTrainingInstances = null;

	/*
	 * Create Training Dataset from CSV File
	 */
	public static Instances createTrainingDataset(String dataset) {

		Instances trainingInstances = null;
		try {
			// creating the training dataset;
			CSVLoader trainingLoader = new CSVLoader();
			trainingLoader.setSource(new File(dataset));
			trainingInstances = trainingLoader.getDataSet();
			trainingInstances.setClass(trainingInstances.attribute(4));
		} catch (IOException ex) {
			//Logger.getLogger(Weka.class.getName()).log(Level.SEVERE, null, ex);
		}
		
		WTrainingInstances = trainingInstances;
		return trainingInstances;
	}

	/*
	 * Create model for training instances
	 */
	public static void trainClassifier(Instances trainingInstances) {
		try {
			
			Classifier classifier = (Classifier) new J48();

			// build the classifier for the training instances
			classifier.buildClassifier(trainingInstances);

			// Evaluating the classifer
			Evaluation eval = new Evaluation(trainingInstances);
			eval.evaluateModel(classifier, trainingInstances);

			ObjectOutputStream out = new ObjectOutputStream(
					new FileOutputStream("J48.model"));
			out.writeObject(classifier);
			out.close();

		} catch (Exception ex) {
			//Logger.getLogger(Weka.class.getName()).log(Level.SEVERE, null, ex);
		}
	}

	/*
	 * Create a test Instance
	 */
	public static void makeInstance(double elevation, double latitude, double longitude,
			int month, String weatherClass) {
		// Create the attributes
		
		int noOfElements = WTrainingInstances.attribute(4).numValues();
		
		FastVector fvNominalVal = new FastVector(4);
		
		for(int i=0;i<noOfElements;i++) {
			fvNominalVal.addElement(WTrainingInstances.attribute(4).value(i));
		}
		
		Attribute attribute1 = new Attribute("ELEVATION");
		Attribute attribute2 = new Attribute("LATITUDE");
		Attribute attribute3 = new Attribute("LONGITUDE");
		Attribute attribute4 = new Attribute("MONTH");
		Attribute attribute5 = new Attribute(weatherClass, fvNominalVal);

		// Create list of attributes in one instance
		FastVector fvWekaAttributes = new FastVector(5);
		fvWekaAttributes.addElement(attribute1);
		fvWekaAttributes.addElement(attribute2);
		fvWekaAttributes.addElement(attribute3);
		fvWekaAttributes.addElement(attribute4);
		fvWekaAttributes.addElement(attribute5);

		testingInstances = new Instances("Test relation", fvWekaAttributes, 10);

		// Set class index
		testingInstances.setClassIndex(4);
		Instance instance = new Instance(5);
		instance.setValue(attribute1, elevation);
		instance.setValue(attribute2, latitude);
		instance.setValue(attribute3, longitude);
		instance.setValue(attribute4, month);
		testingInstances.add(instance);

	}

	/*
	 * Run the classifier and print output
	 */
	public static void testingTheClassifier() {
		try {

			Classifier classifier;

			// load the model
			ObjectInputStream in = new ObjectInputStream(new FileInputStream(
					"J48.model"));
			Object tmp = in.readObject();
			classifier = (Classifier) tmp;
			in.close();
					
			double[] resultDistribution = classifier
					.distributionForInstance(testingInstances.instance(0));
			double score = classifier.classifyInstance(testingInstances
					.instance(0));

			PrintStream fw = new PrintStream(new File("Output.txt"));

			fw.println(testingInstances.classAttribute().value((int) score));

			System.out.print(testingInstances.classAttribute().value(
					(int) score));
			System.out.println();

			for (int i = 0; i < resultDistribution.length; i++) {
				fw.println(Math.ceil(resultDistribution[i] * 100));
				System.out.println(Math.ceil(resultDistribution[i] * 100));
			}

			fw.close();

		} catch (Exception ex) {
			//Logger.getLogger(Weka.class.getName()).log(Level.SEVERE, null, ex);
		}
	}

	
	/*
	 * Main
	 */
	public static void main(String[] args) throws Exception {
		
		String type = args[0];
		String file = "Weather-" + type + ".csv";
		String classVar = type + "_CLASS";
		
		trainClassifier(createTrainingDataset(file));
		makeInstance(Double.parseDouble(args[1]), Double.parseDouble(args[2]),Double.parseDouble(args[3]),Integer.parseInt(args[4]),classVar);
		testingTheClassifier();
	}

}