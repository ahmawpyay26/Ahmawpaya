import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/service_locator.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/usecases/auth_usecases.dart';

// Auth state
class AuthState {
  final UserEntity? user;
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    UserEntity? user,
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final LoginUseCase loginUseCase;
  final LogoutUseCase logoutUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;

  AuthNotifier({
    required this.loginUseCase,
    required this.logoutUseCase,
    required this.getCurrentUserUseCase,
  }) : super(AuthState());

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await loginUseCase(email, password);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
          isAuthenticated: false,
        );
      },
      (user) {
        state = state.copyWith(
          isLoading: false,
          user: user,
          isAuthenticated: true,
          error: null,
        );
      },
    );
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    
    final result = await logoutUseCase();
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (_) {
        state = AuthState();
      },
    );
  }

  Future<void> getCurrentUser() async {
    state = state.copyWith(isLoading: true);
    
    final result = await getCurrentUserUseCase();
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
          isAuthenticated: false,
        );
      },
      (user) {
        state = state.copyWith(
          isLoading: false,
          user: user,
          isAuthenticated: true,
          error: null,
        );
      },
    );
  }
}

// Auth provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    loginUseCase: getIt<LoginUseCase>(),
    logoutUseCase: getIt<LogoutUseCase>(),
    getCurrentUserUseCase: getIt<GetCurrentUserUseCase>(),
  );
});

// Selectors
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

final currentUserProvider = Provider<UserEntity?>((ref) {
  return ref.watch(authProvider).user;
});

final authLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isLoading;
});

final authErrorProvider = Provider<String?>((ref) {
  return ref.watch(authProvider).error;
});

final userRoleProvider = Provider<UserRole?>((ref) {
  return ref.watch(authProvider).user?.role;
});
