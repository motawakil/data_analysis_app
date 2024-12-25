from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.linear_model import LinearRegression
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

import numpy as np

class BaseModel:
    def __init__(self, preprocessing_params, split_params):
        self.preprocessing_params = preprocessing_params
        self.split_params = split_params
        self.scaler = None

    def preprocess(self, X, y):
        """
        Preprocesses data based on the provided preprocessing parameters.
        """
        # Handle missing values
        if self.preprocessing_params.get("missing_values") == "mean":
            X = X.fillna(X.mean())
        elif self.preprocessing_params.get("missing_values") == "median":
            X = X.fillna(X.median())

        # Drop columns with more than 10 unique values
        categorical_columns = X.select_dtypes(include=["object", "category"]).columns
        for col in categorical_columns:
            if X[col].nunique() > 10:
                X = X.drop(columns=[col])

        # Encoding categorical variables
        encoding_method = self.preprocessing_params.get("encodingmethod", "one_hot")
        if encoding_method == "one_hot":
            X = pd.get_dummies(X, drop_first=True)
        elif encoding_method == "label":
            label_encoder = LabelEncoder()
            for col in categorical_columns:
                if col in X.columns:  # Ensure the column wasn't dropped
                    X[col] = label_encoder.fit_transform(X[col])

        # Standardization
        if self.preprocessing_params.get("standardisation") == "yes":
            self.scaler = StandardScaler()
            X = self.scaler.fit_transform(X)

        return X, y

    def evaluate(self, y_true, y_pred):
        """
        Calculates regression performance metrics.
        """
        metrics = {
            "mean_squared_error": mean_squared_error(y_true, y_pred),
            "mean_absolute_error": mean_absolute_error(y_true, y_pred),
            "r2_score": r2_score(y_true, y_pred),
        }
        return metrics


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
        print("spit type is  " , split_type )
        print("spit  split value is " , split_value )
        if split_type == "train_test":
            # Parse split_value for train_test (e.g., "70_30")
            try:
                train_ratio, test_ratio = map(int, split_value.split("_"))
                train_size = train_ratio / 100
                test_size = test_ratio / 100
            except (ValueError, AttributeError):
                raise ValueError(
                    f"Invalid split_value for train_test: {split_value}. "
                    "Expected format: '70_30', '80_20', etc."
                )

            # Ensure the ratios sum up to 1.0
            if not np.isclose(train_size + test_size, 1.0):
                raise ValueError(
                    f"Invalid split_value: train_size + test_size must sum to 100%. Received: {split_value}"
                )

            # Perform train-test split
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, train_size=train_size, test_size=test_size, random_state=42
            )

        elif split_type == "k_fold":
            # Parse split_value for k_fold (e.g., "5", "10")
            try:
                k = int(split_value)
            except ValueError:
                raise ValueError(
                    f"Invalid split_value for k_fold: {split_value}. "
                    "Expected an integer value like '3', '5', or '10'."
                )

            # Ensure k is valid
            if k <= 1:
                raise ValueError(f"Invalid k value: {k}. k must be greater than 1.")

            # Perform k-fold cross-validation
            kf = KFold(n_splits=k, shuffle=True, random_state=42)
            scores = []

            for train_index, test_index in kf.split(X):
                X_train, X_test = X[train_index], X[test_index]
                y_train, y_test = y[train_index], y[test_index]
                self.model.fit(X_train, y_train)
                y_pred = self.model.predict(X_test)
                scores.append(self.evaluate(y_test, y_pred))


            average_scores = {
                metric : np.mean([score[metric] for score in scores])
                for metric in scores[0]
            }

            # Return the average scores across all folds
            return average_scores

        else:
            raise ValueError(
                f"Invalid splitType: {split_type}. Choose either 'train_test' or 'k_fold'."
            )

        # Train the model on the training data
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)

        # Evaluate performance
        performance = self.evaluate(y_test, y_pred)
        return performance





class KNNModel(BaseModel):
    def __init__(self, preprocessing_params, split_params, hyperparameters):
        super().__init__(preprocessing_params, split_params)
        self.hyperparameters = hyperparameters
        self.model = KNeighborsClassifier(
            n_neighbors=hyperparameters.get("n_neighbors", 5),
            weights=hyperparameters.get("weights", "uniform"),
            algorithm=hyperparameters.get("algorithm", "auto")
        )

    def evaluate(self, y_true, y_pred):
        """
        Calculates classification performance metrics.
        """
        metrics = {
            "accuracy": accuracy_score(y_true, y_pred),
            "precision": precision_score(y_true, y_pred, average="weighted"),
            "recall": recall_score(y_true, y_pred, average="weighted"),
            "f1_score": f1_score(y_true, y_pred, average="weighted"),
        }
        return metrics
