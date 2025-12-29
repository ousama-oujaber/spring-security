
import { DocSection } from '../types';

export const DOCS_DATA: DocSection[] = [
  {
    id: 'intro',
    title: '1. Introduction',
    content: `Spring Boot Security is a powerful, highly customizable authentication and access-control framework that provides comprehensive security services for Java applications. It's built on top of Spring Security and leverages Spring Boot's auto-configuration capabilities to simplify security implementation.

### Purpose and Benefits
- **Authentication**: Verify user identity (who are you?)
- **Authorization**: Control access to resources (what can you do?)
- **Protection**: Safeguard against common attacks (CSRF, XSS, etc.)
- **Integration**: Seamless integration with Spring ecosystem
- **Flexibility**: Support for multiple authentication mechanisms
- **Production-Ready**: Battle-tested and widely adopted

### Common Use Cases
- Web applications with form-based login
- REST APIs with JWT tokens
- OAuth2 social login
- Microservices security
- Method-level security`,
  },
  {
    id: 'core-concepts',
    title: '2. Core Concepts',
    content: `Understanding the architectural foundations of Spring Security is critical for building secure applications.

\`\`\`mermaid
graph TD
    A[Request] --> B{Authentication}
    B -- Success --> C{Authorization}
    B -- Failure --> D[401 Unauthorized]
    C -- Success --> E[Resource/Controller]
    C -- Failure --> F[403 Forbidden]
\`\`\``,
    subSections: [
      {
        id: 'auth-vs-authz',
        title: 'Authentication vs Authorization',
        content: `**1. Authentication (WHO are you?)**
- Username/password
- JWT token
- OAuth2 token

**2. Authorization (WHAT can you do?)**
- Roles (e.g., ADMIN, USER)
- Permissions (e.g., READ, WRITE)
- Policies`
      },
      {
        id: 'auth-mechanisms',
        title: 'Authentication Mechanisms',
        content: `The process of verifying a user's identity. Common mechanisms:
- **Form-based**: Traditional username/password through web forms
- **Basic Auth**: HTTP header-based authentication
- **JWT**: Stateless token-based authentication
- **OAuth2**: Token-based delegated authorization`
      },
      {
        id: 'jwt-overview',
        title: 'JWT (JSON Web Tokens)',
        content: `A self-contained token format for secure transmission of information:
\`Header.Payload.Signature\`

- **Header**: Algorithm and token type
- **Payload**: Claims (user info, expiration, etc.)
- **Signature**: Verification hash`
      },
      {
        id: 'oauth2-overview',
        title: 'OAuth2 Framework',
        content: `An authorization framework that enables applications to obtain limited access to user accounts:
- **Authorization Server**: Issues tokens
- **Resource Server**: Protected resources
- **Client**: Application requesting access
- **Resource Owner**: User who grants access`
      }
    ]
  },
  {
    id: 'project-setup',
    title: '3. Project Setup',
    content: "Configure your environment with the necessary dependencies and initial security configurations.",
    subSections: [
      {
        id: 'maven-setup',
        title: '3.1 Dependencies (Maven)',
        content: `Add the following to your \`pom.xml\`:
\`\`\`xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!-- JWT Support -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
\`\`\``
      },
      {
        id: 'minimal-config',
        title: '3.2 Basic Configuration',
        content: `A minimal security configuration using the component-based approach:
\`\`\`java
@Configuration
public class BasicSecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**", "/login").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/home")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
\`\`\`

**Application Properties (YAML)**
\`\`\`yaml
spring:
  security:
    user:
      name: admin
      password: {bcrypt}$2a$10$G8lr9J3F0lHz7bPMa6l5zOq2GzYk8cZzJzXxDl8x8x8x8x8x8x8
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
\`\`\``
      }
    ]
  },
  {
    id: 'common-use-cases',
    title: '4. Common Use Cases',
    content: "Implementation guides for form login, basic auth, and stateless JWT authentication.",
    subSections: [
      {
        id: 'form-login',
        title: '4.1 Form-Based Login',
        content: `Detailed implementation of traditional form login with persistent database users.

**User Entity**
\`\`\`java
@Entity
@Table(name = "users")
@Data
public class User implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    private String password;
    private String email;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> roles;
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
    }
    // Implement other UserDetails methods...
}
\`\`\``
      },
      {
        id: 'jwt-implementation',
        title: '4.3 JWT Authentication',
        content: `Stateless security using tokens for distributed microservices.

**JWT Filter**
\`\`\`java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        // ... extraction and validation logic
    }
}
\`\`\``
      },
      {
        id: 'rbac-logic',
        title: '4.4 Role-Based Access Control',
        content: `Using \`@PreAuthorize\` for fine-grained method security.

\`\`\`java
@Service
@RequiredArgsConstructor
public class UserService {
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    public User updateUser(String username, User updatedUser) {
        // ... logic
    }
}
\`\`\``
      }
    ]
  },
  {
    id: 'oauth2-integration',
    title: '5. OAuth2 Integration',
    content: `Delegated authorization with providers like Google and GitHub. This flow allows third-party services to access user data without exposing credentials.

\`\`\`mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant C as Client (App)
    participant AS as Auth Server (Google)
    participant RS as Resource Server (API)

    U->>C: Clicks "Login with Google"
    C->>AS: Redirect to Auth Page (client_id, scope)
    AS->>U: Prompts for Credentials & Consent
    U->>AS: Logs in & Grants Permission
    AS->>C: Redirects with Authorization Code
    C->>AS: Exchange Auth Code for Access Token
    AS-->>C: Returns Access Token & ID Token
    C->>RS: Request User Profile (Header: Bearer token)
    RS-->>C: Returns User Info (email, name, picture)
    C->>U: Success: Logged In
\`\`\``,
    subSections: [
      {
        id: 'oauth2-config',
        title: '5.1 Provider Setup',
        content: `\`\`\`yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: \${GOOGLE_CLIENT_ID}
            client-secret: \${GOOGLE_CLIENT_SECRET}
            scope: [email, profile, openid]
\`\`\``
      }
    ]
  },
  {
    id: 'exception-handling',
    title: '6. Exception Handling',
    content: "Customizing responses for security failures like expired tokens or insufficient permissions.",
    subSections: [
      {
        id: 'auth-entrypoint',
        title: '6.1 Authentication Entry Point',
        content: `\`\`\`java
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        response.setStatus(401);
        response.setContentType("application/json");
        response.getWriter().write("{\\"error\\": \\"Unauthorized access\\"}");
    }
}
\`\`\``
      }
    ]
  },
  {
    id: 'testing-security',
    title: '7. Testing Security',
    content: "Verifying your security layers with dedicated test annotations.",
    subSections: [
      {
        id: 'unit-testing',
        title: '7.1 Unit Testing Controllers',
        content: `\`\`\`java
@WebMvcTest(UserController.class)
@Import(JwtSecurityConfig.class)
class UserControllerTest {
    @Test
    @WithMockUser(username = "testuser", roles = {"USER"})
    void getUserProfile_Success() throws Exception {
        mockMvc.perform(get("/api/profile"))
               .andExpect(status().isOk());
    }
}
\`\`\``
      }
    ]
  },
  {
    id: 'advanced-topics',
    title: '8. Advanced Topics',
    content: `Method security, CSRF customization, and stateless vs stateful configurations. Central to this is the Security Filter Chain, a series of filters that inspect every request.

\`\`\`mermaid
graph TD
    subgraph "Spring Security Filter Chain"
    REQ((HTTP Request)) --> CORS[CorsFilter]
    CORS --> CSRF[CsrfFilter]
    CSRF --> LOGOUT[LogoutFilter]
    LOGOUT --> JWT[JwtAuthenticationFilter]
    JWT --> AUTH_MGR{Authentication Manager}
    AUTH_MGR --> AUTHZ[AuthorizationFilter]
    AUTHZ --> SEC_CTX[SecurityContextPersistenceFilter]
    SEC_CTX --> CTRL[[RestController / Resource]]
    end

    JWT -.-> |"If token valid"| AUTH_MGR
    AUTH_MGR -.-> |"Fills"| SEC_CTX
\`\`\``,
    subSections: [
      {
        id: 'method-security',
        title: '8.1 Method Security',
        content: `\`\`\`java
@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class MethodSecurityConfig {}

@Service
public class SecureService {
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSensitiveData() {}
}
\`\`\``
      },
      {
        id: 'cors-csrf',
        title: '8.2 CORS & CSRF',
        content: `**CORS Configuration**
\`\`\`java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
\`\`\``
      }
    ]
  },
  {
    id: 'best-practices',
    title: '9. Best Practices',
    content: `Hardening your application for production.

### Common Pitfalls
- **Weak Secrets**: Using short or simple secret keys for JWT.
- **Hardcoded Credentials**: Storing passwords in version control.
- **Overly Permissive CORS**: Allowing \`*\` in production.
- **Ignoring CSRF**: Disabling CSRF protection without a valid stateless alternative.

### Production Security Checklist
- [x] Use HTTPS only (HTTP Strict Transport Security)
- [x] Strong password policies (12+ characters, complexity)
- [x] Account lockout after failed attempts
- [x] Secure session management (timeout, fixation protection)
- [x] CSRF protection enabled for stateful sessions
- [x] CORS properly configured (no wildcard origins)
- [x] Standard security headers configured
- [x] Input validation on all endpoints
- [x] Secure password storage (BCrypt/Argon2)
- [ ] Regular secrets rotation (JWT, OAuth2 secrets)
- [ ] Audit logging enabled for all security events
- [ ] API Rate limiting implemented
- [ ] Regular security testing (OWASP ZAP scanning)`,
  },
  {
    id: 'references',
    title: '10. References',
    content: `### Official Documentation
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [Spring Boot Security Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.security)
- [OAuth2 Login Guide](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/index.html)
- [JWT.io Debugger](https://jwt.io/)

### Recommended Reading
- **"Spring Security in Action"** by Laurentiu Spilca
- **"OAuth 2.0 Cookbook"** by Packt Publishing
- **"Hands-On Spring Security 5"** by Packt Publishing

### Useful Tools
- **OWASP ZAP**: Security vulnerability scanner
- **Keycloak**: Open-source identity and access management
- **Vault by HashiCorp**: Secrets management`,
  }
];
