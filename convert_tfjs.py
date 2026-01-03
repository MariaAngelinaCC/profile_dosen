# convert_tfjs.py
import sys
import os
import subprocess

print("=" * 50)
print("TENSORFLOW.JS MODEL CONVERTER")
print("=" * 50)

# Step 1: Check model file
print("\n🔍 STEP 1: Checking model file...")
if not os.path.exists('models'):
    print("❌ Folder 'models' not found!")
    os.makedirs('models', exist_ok=True)
    print("📁 Created 'models' folder")
    print("⚠️ Please copy 'model_jambu.keras' to models/ folder")
    input("Press Enter after copying the file...")

if not os.path.exists('models/model_jambu.keras'):
    print("❌ File 'models/model_jambu.keras' not found!")
    print("Current directory:", os.getcwd())
    print("Contents of models/:", os.listdir('models') if os.path.exists('models') else "No models folder")
    sys.exit(1)

print("✅ Model file found: models/model_jambu.keras")
file_size = os.path.getsize('models/model_jambu.keras') / (1024*1024)
print(f"📊 File size: {file_size:.2f} MB")

# Step 2: Install tensorflowjs
print("\n🔧 STEP 2: Installing tensorflowjs...")
try:
    import tensorflowjs
    print("✅ tensorflowjs already installed")
except ImportError:
    print("Installing tensorflowjs...")
    try:
        # Try pip first
        subprocess.check_call([sys.executable, "-m", "pip", "install", "tensorflowjs", "--user"])
        print("✅ tensorflowjs installed via pip")
    except:
        print("❌ Failed with pip, trying conda...")
        try:
            subprocess.check_call(["conda", "install", "-c", "conda-forge", "tensorflowjs", "-y"])
            print("✅ tensorflowjs installed via conda")
        except:
            print("❌ Failed to install tensorflowjs")
            print("\n💡 MANUAL INSTALLATION:")
            print("Open a NEW terminal as Administrator and run:")
            print("1. pip install tensorflowjs")
            print("2. OR: conda install -c conda-forge tensorflowjs")
            sys.exit(1)

# Step 3: Check/install tensorflow
print("\n🔧 STEP 3: Checking TensorFlow...")
try:
    import tensorflow as tf
    print(f"✅ TensorFlow version: {tf.__version__}")
except ImportError:
    print("Installing TensorFlow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "tensorflow", "--user"])
    import tensorflow as tf
    print(f"✅ TensorFlow installed: {tf.__version__}")

# Step 4: Convert model
print("\n🔄 STEP 4: Converting model to TensorFlow.js format...")
try:
    # Load the model
    print("Loading Keras model...")
    model = tf.keras.models.load_model('models/model_jambu.keras')
    print("✅ Model loaded successfully")
    
    # Create output directory
    os.makedirs('public/model_tfjs', exist_ok=True)
    
    # Import tensorflowjs (should work now)
    import tensorflowjs as tfjs
    
    # Convert and save
    print("Converting...")
    tfjs.converters.save_keras_model(model, 'public/model_tfjs')
    
    print("\n" + "=" * 50)
    print("🎉 CONVERSION SUCCESSFUL!")
    print("=" * 50)
    
    print("\n📁 Output directory: public/model_tfjs/")
    print("📄 Generated files:")
    for file in os.listdir('public/model_tfjs'):
        file_path = os.path.join('public/model_tfjs', file)
        size_kb = os.path.getsize(file_path) / 1024
        print(f"   • {file} ({size_kb:.1f} KB)")
    
    print("\n✅ NEXT STEPS:")
    print("1. Install in Next.js project: npm install @tensorflow/tfjs")
    print("2. Model is ready to use at: /model_tfjs/model.json")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()