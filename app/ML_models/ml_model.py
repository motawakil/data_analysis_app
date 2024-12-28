from sklearn.model_selection import train_test_split, KFold, StratifiedKFold , GridSearchCV, RandomizedSearchCV, train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score
)
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsClassifier
import pandas as pd
import numpy as np

class BaseModel:
    def __init__(self, preprocessing_params, split_params):
        self.preprocessing_params = preprocessing_params
        self.split_params = split_params
        self.scaler = None  # Will be initialized if standardization is applied

    def preprocess(self, X, y):
        """
        Preprocesses data based on the provided preprocessing parameters.
        """
        # Handle missing values
        if self.preprocessing_params.get("missing_values") == "mean":
            X = X.fillna(X.mean())
            print("missing values handling with moyenne ")
        elif self.preprocessing_params.get("missing_values") == "median":
            X = X.fillna(X.median())
            print("missing values handling with median ")

        # Drop columns with more than 20 unique values
        categorical_columns = X.select_dtypes(include=["object", "category"]).columns
        for col in categorical_columns:
            if X[col].nunique() > 20:
                X = X.drop(columns=[col])

        # Encoding categorical variables
        encoding_method = self.preprocessing_params.get("encodingmethod", "one_hot")
        if encoding_method == "one_hot":
            X = pd.get_dummies(X, drop_first=True)
            print("encoding methode applied succesfuly  for one hot") 
        elif encoding_method == "label":
            label_encoder = LabelEncoder()
            print("encoding methode applied succesfuly  for label") 
            for col in categorical_columns:
                if col in X.columns:  # Ensure the column wasn't dropped
                    X[col] = label_encoder.fit_transform(X[col])

        # Standardization (if selected)
        if self.preprocessing_params.get("standardisation") == "yes":
            print("standarisation applied succesfuly")
            self.scaler = StandardScaler()
            X = self.scaler.fit_transform(X)

        return X, y


class LinearRegressionModel(BaseModel):
    def __init__(self, preprocessing_params, split_params, hyperparameters):
        super().__init__(preprocessing_params, split_params)
        include_intercept = hyperparameters.get("includeintercept", "true").lower() == "true"
        self.hyperparameters = {**hyperparameters, "include_intercept": include_intercept}
        self.model = LinearRegression(
            fit_intercept=self.hyperparameters.get("include_intercept", True)
        )

    def train(self, X, y):
        # Preprocess the data
        X, y = self.preprocess(X, y)

        # Extract split parameters
        split_type = self.split_params.get("type")
        split_value = self.split_params.get("train_size")
        
        if split_type == "train_test":
            # Parse split_value for train_test
            try:
                train_ratio, test_ratio = map(int, split_value.split("_"))
                train_size = train_ratio / 100
                test_size = test_ratio / 100
            except (ValueError, AttributeError):
                raise ValueError(
                    f"Invalid split_value for train_test: {split_value}. "
                    "Expected format: '70_30', '80_20', etc."
                )

            if not np.isclose(train_size + test_size, 1.0):
                raise ValueError(
                    f"Invalid split_value: train_size + test_size must sum to 100%. Received: {split_value}"
                )

            # Perform train-test split
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, train_size=train_size, test_size=test_size, random_state=42
            )
            self.model.fit(X_train, y_train)
            y_pred = self.model.predict(X_test)
            return self.evaluate(y_test, y_pred)

        elif split_type == "k_fold":
            try:
                k = int(split_value)
            except ValueError:
                raise ValueError(
                    f"Invalid split_value for k_fold: {split_value}. Expected an integer like '5' or '10'."
                )

            if k <= 1:
                raise ValueError(f"Invalid k value: {k}. k must be greater than 1.")

            kf = KFold(n_splits=k, shuffle=True, random_state=42)
            scores = []

            for train_index, test_index in kf.split(X):
                X_train, X_test = X[train_index], X[test_index]
                y_train, y_test = y[train_index], y[test_index]
                self.model.fit(X_train, y_train)
                y_pred = self.model.predict(X_test)
                scores.append(self.evaluate(y_test, y_pred))

            # Calculate average scores across all folds
            return {metric: np.mean([score[metric] for score in scores]) for metric in scores[0]}

        else:
            raise ValueError(f"Invalid splitType: {split_type}. Choose either 'train_test' or 'k_fold'.")

    def evaluate(self, y_true, y_pred):
        """
        Calculates regression performance metrics.
        """
        return {
            "mean_squared_error": mean_squared_error(y_true, y_pred),
            "mean_absolute_error": mean_absolute_error(y_true, y_pred),
            "r2_score": r2_score(y_true, y_pred),
        }
    
class KNNModel(BaseModel):
    def __init__(self, preprocessing_params, split_params, hyperparameters):
        super().__init__(preprocessing_params, split_params)
        self.hyperparameters = hyperparameters
        self.model = None

    def initialize_model(self):
        self.model = KNeighborsClassifier(
            n_neighbors=self.hyperparameters.get("n_neighbors", 5),
            weights=self.hyperparameters.get("weights", "uniform"),
            algorithm=self.hyperparameters.get("algorithm", "auto"),
        )
        print("KNN model initialized with:", self.hyperparameters)

    def train_test_split(self, X, y, train_size):
        X_preprocessed, y_preprocessed = self.preprocess(X, y)
        X_train, X_test, y_train, y_test = train_test_split(
            X_preprocessed, y_preprocessed, train_size=float(train_size)
        )
        print(f"Data split into {train_size * 100}% train and {(1 - train_size) * 100}% test.")

        self.initialize_model()
        self.model.fit(X_train, y_train)
        print("Model training completed.")

        predictions = self.model.predict(X_test)

        # Calculate metrics
        performance = {
            "accuracy": accuracy_score(y_test, predictions),
            "precision": precision_score(y_test, predictions, average="weighted"),
            "recall": recall_score(y_test, predictions, average="weighted"),
            "f1_score": f1_score(y_test, predictions, average="weighted"),
        }
        print("Performance metrics:", performance)
        return performance

    def k_fold_split(self, X, y, k_folds):
        X_preprocessed, y_preprocessed = self.preprocess(X, y)
        kf = KFold(n_splits=k_folds, shuffle=True, random_state=42)
        print(f"Performing {k_folds}-fold cross-validation.")

        metrics_list = []
        for train_index, test_index in kf.split(X_preprocessed):
            X_train, X_test = X_preprocessed[train_index], X_preprocessed[test_index]
            y_train, y_test = y_preprocessed[train_index], y_preprocessed[test_index]

            self.initialize_model()
            self.model.fit(X_train, y_train)
            predictions = self.model.predict(X_test)

            # Collect metrics for each fold
            fold_metrics = {
                "accuracy": accuracy_score(y_test, predictions),
                "precision": precision_score(y_test, predictions, average="weighted"),
                "recall": recall_score(y_test, predictions, average="weighted"),
                "f1_score": f1_score(y_test, predictions, average="weighted"),
            }
            metrics_list.append(fold_metrics)

        # Aggregate metrics across folds
        performance = {
            metric: np.mean([fold[metric] for fold in metrics_list])
            for metric in ["accuracy", "precision", "recall", "f1_score"]
        }
        print("Cross-validation performance metrics:", performance)
        return performance
