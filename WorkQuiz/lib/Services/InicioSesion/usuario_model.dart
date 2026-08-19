class Usuario {
  final String id;
  final String nombre;
  final String email;
  final String? imagenPerfil;
  final String? descripcion;
  final DateTime? createdAt;

  Usuario({
    required this.id,
    required this.nombre,
    required this.email,
    this.imagenPerfil,
    this.descripcion,
    this.createdAt,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: json['_id'] as String,
      nombre: json['nombre'] as String,
      email: json['email'] as String,
      imagenPerfil: json['imagenPerfil'] as String?,
      descripcion: json['descripcion'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'nombre': nombre,
      'email': email,
      if (imagenPerfil != null) 'imagenPerfil': imagenPerfil,
      if (descripcion != null) 'descripcion': descripcion,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }
}