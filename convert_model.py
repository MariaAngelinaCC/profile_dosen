import tensorflow as tf
import tensorflowjs as tfjs

# Load model keras
model = tf.keras.models.load_model('models/model_jambu.keras')

# Convert to TFJS format
tfjs.converters.save_keras_model(model, 'public/model_tfjs')
