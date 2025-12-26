import numpy as np
import time
from itertools import permutations, combinations

class TSPSolver:
    def __init__(self, distance_matrix):
        """
        Initialise le solveur TSP avec une matrice de distances
        :param distance_matrix: matrice n x n des distances entre villes
        """
        self.distance_matrix = np.array(distance_matrix)
        self.n = len(distance_matrix)
    
    def brute_force(self):
        """
        Méthode exacte par énumération de tous les cycles hamiltoniens
        Complexité: O(n!)
        """
        start_time = time.time()
        
        # Villes à visiter (sans la ville 0 qui est le point de départ)
        cities = list(range(1, self.n))
        
        min_cost = float('inf')
        best_path = None
        total_paths = 0
        
        # Énumération de toutes les permutations
        for perm in permutations(cities):
            total_paths += 1
            # Construction du cycle: 0 -> perm -> 0
            path = [0] + list(perm) + [0]
            
            # Calcul du coût du cycle
            cost = 0
            for i in range(len(path) - 1):
                cost += self.distance_matrix[path[i]][path[i+1]]
            
            # Mise à jour du minimum
            if cost < min_cost:
                min_cost = cost
                best_path = path
        
        execution_time = time.time() - start_time
        
        return {
            'method': 'Brute Force',
            'cost': float(min_cost),
            'path': best_path,
            'time': execution_time,
            'paths_explored': total_paths
        }
    
    def bellman_held_karp(self):
        """
        Algorithme de Bellman-Held-Karp utilisant la programmation dynamique
        Complexité: O(2^n * n^2)
        """
        start_time = time.time()
        
        n = self.n
        
        # C[S][j] = coût minimum pour visiter les villes dans S en terminant à j
        # S est représenté comme un frozenset, j est l'index de la ville
        C = {}
        parent = {}
        
        # Initialisation: chemins de longueur 1 (0 -> j)
        for j in range(1, n):
            key = (frozenset([j]), j)
            C[key] = self.distance_matrix[0][j]
            parent[key] = 0
        
        # Itération sur les tailles de sous-ensembles
        for subset_size in range(2, n):
            # Générer tous les sous-ensembles de taille subset_size (sans inclure 0)
            for subset in combinations(range(1, n), subset_size):
                subset_set = frozenset(subset)
                
                # Pour chaque ville j dans le sous-ensemble
                for j in subset:
                    # Sous-ensemble sans j
                    prev_subset = subset_set - {j}
                    
                    min_cost = float('inf')
                    min_prev = None
                    
                    # Trouver le meilleur prédécesseur i
                    for i in prev_subset:
                        prev_key = (prev_subset, i)
                        if prev_key in C:
                            cost = C[prev_key] + self.distance_matrix[i][j]
                            if cost < min_cost:
                                min_cost = cost
                                min_prev = i
                    
                    if min_prev is not None:
                        key = (subset_set, j)
                        C[key] = min_cost
                        parent[key] = min_prev
        
        # Trouver le coût optimal en ajoutant le retour à 0
        all_cities = frozenset(range(1, n))
        min_cost = float('inf')
        last_city = None
        
        for j in range(1, n):
            key = (all_cities, j)
            if key in C:
                cost = C[key] + self.distance_matrix[j][0]
                if cost < min_cost:
                    min_cost = cost
                    last_city = j
        
        # Reconstruction du chemin
        path = self._reconstruct_path_bhk(parent, last_city, all_cities)
        
        execution_time = time.time() - start_time
        
        return {
            'method': 'Bellman-Held-Karp',
            'cost': float(min_cost),
            'path': path,
            'time': execution_time,
            'states_computed': len(C)
        }
    
    def _reconstruct_path_bhk(self, parent, last_city, all_cities):
        """
        Reconstruit le chemin optimal à partir de la table parent
        """
        path = []
        current_set = all_cities
        current_city = last_city
        
        # Remonter de la fin au début
        while current_set:
            path.append(current_city)
            key = (current_set, current_city)
            if key not in parent:
                break
            prev_city = parent[key]
            current_set = current_set - {current_city}
            current_city = prev_city
        
        # Ajouter la ville de départ
        path.append(0)
        path.reverse()
        path.append(0)  # Retour à la ville de départ
        
        return path
    
    def compare_methods(self):
        results = []

        # Brute Force: limité aux petits graphes
        if self.n <= 15:
            try:
                bf_result = self.brute_force()
                results.append(bf_result)
            except Exception as e:
                results.append({
                    'method': 'Brute Force',
                    'error': str(e),
                    'time': 0
                })
        else:
            results.append({
                'method': 'Brute Force',
                'error': f'Graph too large for brute force (n={self.n} > 10)',
                'time': 0
            })
    
        # Bellman-Held-Karp: limité aussi mais peut gérer plus
        if self.n <= 20:
            try:
                bhk_result = self.bellman_held_karp()
                results.append(bhk_result)
            except Exception as e:
                results.append({
                    'method': 'Bellman-Held-Karp',
                    'error': str(e),
                    'time': 0
                })
        else:
            results.append({
                'method': 'Bellman-Held-Karp',
                'error': f'Graph too large for dynamic programming (n={self.n} > 20)',
                'time': 0
            })

        return results


def generate_random_graph(n, min_dist=1, max_dist=100):
    """
    Génère un graphe complet aléatoire avec n villes
    """
    np.random.seed(None)
    matrix = np.random.randint(min_dist, max_dist, size=(n, n))
    
    # Rendre la matrice symétrique et mettre 0 sur la diagonale
    matrix = (matrix + matrix.T) // 2
    np.fill_diagonal(matrix, 0)
    
    return matrix.tolist()


def get_example_graph_6():
    """
    Retourne le graphe d'exemple avec 6 villes
    """
    return [
        [0, 10, 15, 20, 25, 30],
        [10, 0, 35, 25, 20, 15],
        [15, 35, 0, 30, 18, 12],
        [20, 25, 30, 0, 15, 28],
        [25, 20, 18, 15, 0, 10],
        [30, 15, 12, 28, 10, 0]
    ]