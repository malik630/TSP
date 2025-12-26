from flask import Flask, request, jsonify
from flask_cors import CORS
from tsp_solver import TSPSolver, generate_random_graph, get_example_graph_6
import logging
logging.basicConfig(level=logging.DEBUG)


app = Flask(__name__)
CORS(app)

@app.route('/api/solve', methods=['POST'])
def solve_tsp():
    """
    Endpoint pour résoudre le TSP
    """
    try:
        data = request.get_json()
        print(data)
        if data is None:
            return jsonify({'error': 'Invalid or missing JSON'}), 400
        
        distance_matrix = data.get('distance_matrix')
        
        if not distance_matrix:
            return jsonify({'error': 'Distance matrix is required'}), 400
        
        solver = TSPSolver(distance_matrix)
        results = solver.compare_methods()
        
        return jsonify({
            'success': True,
            'results': results,
            'n': solver.n
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/generate', methods=['POST'])
def generate_graph():
    """
    Endpoint pour générer un graphe aléatoire
    """
    try:
        data = request.get_json()
        n = data.get('n', 6)
        
        if n < 3:
            return jsonify({'error': 'n must be at least 3'}), 400
        
        if n > 15:
            return jsonify({'error': 'n must be at most 15 for performance reasons'}), 400
        
        matrix = generate_random_graph(n)
        
        return jsonify({
            'success': True,
            'distance_matrix': matrix,
            'n': n
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/example', methods=['GET'])
def get_example():
    """
    Endpoint pour obtenir le graphe d'exemple avec 6 villes
    """
    try:
        matrix = get_example_graph_6()
        
        return jsonify({
            'success': True,
            'distance_matrix': matrix,
            'n': 6
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/benchmark', methods=['POST'])
def benchmark():
    """
    Endpoint pour faire un benchmark sur différentes valeurs de n
    """
    try:
        data = request.get_json()
        start_n = data.get('start_n', 3)
        end_n = data.get('end_n', 10)
        
        if end_n > 12:
            return jsonify({'error': 'end_n must be at most 12 for performance reasons'}), 400
        
        results = []
        
        for n in range(start_n, end_n + 1):
            matrix = generate_random_graph(n)
            solver = TSPSolver(matrix)
            
            method_results = solver.compare_methods()
            
            results.append({
                'n': n,
                'methods': method_results
            })
        
        return jsonify({
            'success': True,
            'results': results
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Backend démarré sur http://localhost:5000")
    app.run(debug=True, port=5000)